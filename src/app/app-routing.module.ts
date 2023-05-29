import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },

  {
    path: 'auth', component: LoginComponent
  },
  {
    path: 'conversations', component: ConversationsComponent,canActivate:[AuthGuard]
  },
  { path: 'dashboard', component: DashboardComponent,canActivate:[AuthGuard] },
   { path: 'dashboard/:passCode', component: DashboardComponent,canActivate:[AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
