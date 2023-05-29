import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { User } from '../shared/user-model';
import { BehaviorSubject, Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userChanges = new BehaviorSubject<User>({});

  user?: firebase.User | null;
  authStateChanges$?: Observable<firebase.User | null>;

  constructor(private fireAuth: AngularFireAuth, private router: Router, private fireFirestore: AngularFirestore) {
    this.authStateChanges$ = this.fireAuth.authState;
    this.authStateChanges$.subscribe((user) => {
      this.user = user;

    });
  }

  googleSignIn() {
    return this.fireAuth.signInWithPopup(new GoogleAuthProvider).then((res) => {
      this.setUserData(res.user);
      this.router.navigate(['/dashboard'])
    })
  }



  setUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.fireFirestore.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,

    };
    localStorage.setItem('uid', user.uid);
    this.userChanges.next(userData)

    return userRef.set(userData, {
      merge: true,
    });
  }

  logout() {
    this.fireAuth.signOut().then(() => {
    }).catch((err) => {
      console.log(err)
    })
  }
}
