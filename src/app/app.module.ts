import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import {AngularFireModule} from '@angular/fire/compat';
import { ConversationsComponent } from './conversations/conversations.component'
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatListComponent } from './conversations/chat-list/chat-list.component';
import { ChatWindowComponent } from './conversations/chat-window/chat-window.component';
import { ErrorComponent } from './error/error.component';
import { SendMessageComponent } from './conversations/send-message/send-message.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ConversationsComponent,
    DashboardComponent,
    ChatListComponent,
    ChatWindowComponent,
    ErrorComponent,
    SendMessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  AngularFireModule.initializeApp(environment.firebase),
  
  ],
  providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
