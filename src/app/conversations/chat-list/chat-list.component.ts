import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { AuthService } from 'src/app/auth/auth.service';
import { ConversationsService, PassCode } from '../conversations.service';
import { Router } from '@angular/router';
import { Observable, Subscription, filter, switchMap, take } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit, OnDestroy {

  chatList?: Observable<PassCode[]>;
  selected: string = '';
  uid?: string | null;
  user?: firebase.User | null;
  passCodes: Observable<PassCode[]> | undefined;
  codeSub: Subscription | undefined;





 



  constructor(
    private convoService: ConversationsService,
    private authService: AuthService,
    private router: Router,
  ) {
    
  }
  
  ngOnInit(): void {

    this.authService.authStateChanges$?.subscribe(user => {
      this.user = user;
      this.uid = user?.uid;
      this.chatList = this.convoService.getPassCodes(user?.uid);

      this.chatList.subscribe();
    });

    this.convoService.passCodeChanges.subscribe(p => {
      this.selected = p;
    });
  }

  formatDate(value: Timestamp): string {
    const date = value.toDate();
    return date.toLocaleString();
  }

  selectChat(chat: string) {
    this.selected = chat;
    this.router.navigate(['/dashboard', chat]);
  }

  ngOnDestroy(): void {
    if (this.codeSub) {
      this.codeSub.unsubscribe();
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate([''])
  }

  onAddNew() {
    this.router.navigate(['conversations'])
  }

}
