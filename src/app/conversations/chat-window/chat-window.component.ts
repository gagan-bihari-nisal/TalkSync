import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConversationsService, MessageData, PassCode } from '../conversations.service';
import { Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import 'firebase/auth';
import * as moment from 'moment';
import { Timestamp } from '@angular/fire/firestore';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollBottom') private scrollBottom!: ElementRef;

  user?: firebase.User | null;
  messages: MessageData[] = [];
  uid?: string | null;
  title?: string;
  messagesSubscription: Subscription | undefined;
  selected = false;
  editing: boolean = false;
  newTitle?: string = '';
  @ViewChild('modal') modal: ElementRef | undefined;

  showError = false;
  errorMsg = '';

  closeError() {
    this.showError = false;
  }

  constructor(private convoService: ConversationsService, private route: ActivatedRoute, private authService: AuthService) { }

  formatDate(value: Timestamp): string {
    const date = value.toDate();
    return date.toLocaleString();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
    } catch (err) { }
  }

  sendMessage(form: NgForm) {
    const message = form.value.message.trim();
    try {
      this.convoService.sendMessage(message, this.user);
      this.scrollToBottom();
      form.reset();
    } catch (error) {
      this.errorMsg = 'Failed to send message. Please try again.';
      this.showError = true;
      console.log(this.errorMsg)
    }
  }


  openModal() {
    this.newTitle = this.title;
    this.editing = true;
    setTimeout(() => {
      this.modal?.nativeElement.focus();
    }, 0);
  }

  saveTitle() {
    this.title = this.newTitle;
    this.editing = false;
    const passCode = this.route.snapshot.paramMap.get('passCode') || '';
    this.convoService.passCodeChanges.next(passCode)
    this.authService.authStateChanges$?.subscribe(user => {
      this.convoService.storePassCode(passCode, user?.uid, this.newTitle);
    })
  }

  cancelEditing() {
    this.editing = false
  }

  ngOnInit(): void {
    this.authService.authStateChanges$?.subscribe(user => {
      this.user = user
      this.uid = user?.uid
    })

    this.route.paramMap.subscribe((params) => {
      const passCode = params.get('passCode') ?? "";
      this.convoService.passCodeChanges.next(passCode)
      if (passCode) {
        this.selected = true;
      } else {
        this.selected = false;
      }
    });


    this.convoService.passCodeChanges.subscribe((passCode) => {
      if (passCode) {
        try {
          this.messagesSubscription = this.convoService.retrieveMessages(passCode).subscribe((messages) => {
            this.messages = messages;
          });
        } catch (error) {
          this.errorMsg = 'Failed to retrieve messages. Please try again.';
          this.showError = true;
        }
      }

      this.authService.authStateChanges$?.subscribe(user => {
        this.convoService.getPassCodes(user?.uid).subscribe(passcodes => {
          passcodes.forEach(passcode => {
            if (passCode === passcode.passCode) {
              this.title = passcode.title
            }
          })
        })
      })
    });
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }
}
