import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConversationsService } from './conversations.service';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { AuthService } from '../auth/auth.service';
@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit {

  passCode: string = '';
  user?: firebase.User | null;
  uid?: string | null;
  showError = false;
  errorMsg = '';

  constructor(private convoService: ConversationsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authStateChanges$?.subscribe(user => {
      this.user = user
      this.uid = user?.uid
    })
  }

  closeError() {
    this.showError = false;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    var code = form.value.passCode.toString().trim()
    if (code.length > 20 || code.includes(' ')) {
      this.errorMsg = 'Invalid code. Please try again.';
      this.showError = true;
      console.log(this.errorMsg)
      return;
    }
    try {
      this.convoService.joinConversation(code.trim(), this.uid);
    } catch (err) {
      this.errorMsg = 'Failed to join conversations. Please try again.';
      this.showError = true;
    }
  }

  addNewConvo() {
    this.convoService.createPassCode()
      .then(passcode => {
        this.passCode = passcode
      })
      .catch(error => {
        this.errorMsg = 'Failed to generate passcode. Please try again.';
        this.showError = true;
      });
  }

}
