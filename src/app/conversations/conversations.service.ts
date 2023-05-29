import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import {
  AngularFirestore,
} from '@angular/fire/compat/firestore';
import { Timestamp } from "@angular/fire/firestore";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Observable, catchError, map, of, take, tap } from "rxjs";
import { User } from "../shared/user-model";
@Injectable({
  providedIn: 'root'
})
export class ConversationsService {

  passCodeChanges = new BehaviorSubject<string>('');
  currentUser = new BehaviorSubject<User>({});
  messages: BehaviorSubject<MessageData[]> = new BehaviorSubject<MessageData[]>([]);
  passCodes: BehaviorSubject<PassCode[]> = new BehaviorSubject<PassCode[]>([]);


  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth, private router: Router, private route: ActivatedRoute) { }


  updatePassCode(): Observable<any> {
    const urlSegments = this.route.snapshot.url;
    const lastSegment = urlSegments.pop()?.toString();
    const passCode = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
    return of(lastSegment)
  }

  createPassCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.firestore.collection('conversations').add({}).then(res => {
        const passcode = res.id.toString();
        resolve(passcode);
      }).catch(error => {
        reject(error);
      });
    });
  }


  passCodeExists(passCode: string): Observable<boolean> {
    return this.firestore.collection('conversations').doc(passCode).get().pipe(
      map(doc => (doc.id === passCode)
      ),
      catchError(() =>
        of(false)
      )
    );
  }

  joinConversation(passCode: string, uid?: string | null) {
    this.passCodeExists(passCode).subscribe(exists => {
      if (exists) {
        this.storePassCode(passCode, uid);
        this.firestore.collection('conversations').doc(passCode).get().pipe(
          catchError(error => {
            throw new Error('Failed to join the conversations.')
          })
        ).subscribe(res => {
          this.passCodeChanges.next(passCode);
          if (uid) {
            this.router.navigate(['/dashboard', passCode.trim()]);
          } else {
            console.error('User not authenticated.');
          }
        });
      } else {
      }
    });
  }

  sendMessage(message: string, user?: firebase.User | null) {
    if (user) {
      this.passCodeChanges.pipe(
        take(1),
      ).subscribe(passCode => {
        this.firestore.collection('conversations').doc(passCode).collection('messages').add({
          text: message,
          createdAt: new Date(),
          uid: user.uid,
          name: user.displayName,
          avatar: user.photoURL
        })
          .then(() => {
            this.storePassCode(passCode, user.uid);
            this.retrieveMessages(passCode).subscribe(updatedMessages => {
              this.messages.next(updatedMessages);
            });


          })
          .catch(error => {
            throw new Error('Sending Message Failed')
          });
      })
    } else {
      throw new Error('User is not authenticated')
    }
  }

  retrieveMessages(passCode: string): Observable<MessageData[]> {
    return this.firestore
      .collection('conversations')
      .doc(passCode)
      .collection('messages', (ref) => ref.orderBy('createdAt'))
      .snapshotChanges()
      .pipe(
        map((snapshot) => {
          return snapshot.map((doc) => {
            const data = doc.payload.doc.data() as MessageData;
            const id = doc.payload.doc.id;
            return { id, ...data };
          });
        }),
        tap((messages: MessageData[]) => {
          this.messages.next(messages);
        }),
        catchError(error => {
          throw new Error('Failed to retrieve messages');
        })
      );
  }


  getPassCodes(uid?: string | null): Observable<PassCode[]> {
    if (uid) {
      const passCodesCollection = this.firestore.collection<PassCode>('passCodes').doc(uid).collection<PassCode>('passCodes');

      return passCodesCollection.valueChanges().pipe(
        map(querySnapshot => {
          const passCodes = querySnapshot.sort((a, b) => b.updatedOn.seconds - a.updatedOn.seconds);
          return passCodes;
        })
      );
    } else {
      return of([]);
    }
  }

  storePassCode(passCode: string, uid?: string | null, title?: string) {
    if (uid) {
      const passCodeRef = this.firestore.collection('passCodes').doc(uid).collection("passCodes").doc(passCode);

      passCodeRef.get().subscribe(doc => {
        if (doc.exists) {
          const updateData: Partial<PassCode> = {
            updatedOn: firebase.firestore.Timestamp.now() as any
          };

          if (title !== undefined) {
            updateData.title = title;
          }

          passCodeRef.update(updateData)
            .then(() => {
              this.getPassCodes(uid).subscribe(passCodes => {
               
                this.passCodes.next(passCodes);
              })
            })
            .catch(error => {
            });
        } else {
          const newData: PassCode = {
            passCode: passCode,
            title: title || "New Chat",
            updatedOn: firebase.firestore.Timestamp.now() as any
          };

          passCodeRef.set(newData)
            .then(() => {
              this.getPassCodes(uid).subscribe(passCodes => {

              })
            })
            .catch(error => {
            });
        }
      });
    }
  }
}


export interface PassCode {
  passCode: string,
  title?: string,
  updatedOn: Timestamp,
}

export interface MessageData {
  text: string,
  name: string,
  avatar: string,
  createdAt: Timestamp,
  uid: string
}


