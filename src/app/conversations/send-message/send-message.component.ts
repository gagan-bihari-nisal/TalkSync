import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConversationsService } from '../conversations.service';
import { NgForm } from '@angular/forms';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css']
})
export class SendMessageComponent implements OnInit {
  
//  @ViewChild('scrollBottom') private scrollBottom!: ElementRef;
  showError = false;
  errorMsg = '';
  user?: firebase.User | null;
  uid?: string | null;
 
  constructor(private convoService:ConversationsService,private authService:AuthService) { }

  ngOnInit(): void {
    this.authService.authStateChanges$?.subscribe(user => {
      this.user = user
      this.uid = user?.uid
    })
  }

  // scrollToBottom(): void {
  //   try {
  //     this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
  //   } catch (err) { }
  // }

  sendMessage(form: NgForm) {
    const message = form.value.message.trim();
    try {
      this.convoService.sendMessage(message, this.user);
    //  this.scrollToBottom();
      form.reset();
    } catch (error) {
      this.errorMsg = 'Failed to send message. Please try again.';
      this.showError = true;
      console.log(this.errorMsg)
    }
  }

}
