import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { error } from 'console';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  showError = false;
  errorMsg = '';
  isLoading = false;


  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  signInWithGoogle() {
    this.isLoading = true
    this.authService.googleSignIn().then(res => {
      this.isLoading = false
    }).catch(error => {
      this.isLoading = false
      this.errorMsg = 'Authentication Failed'
      this.showError = true;
    })
  }

  closeError() {
    this.showError = false;
  }

}
