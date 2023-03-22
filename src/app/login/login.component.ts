import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private route: ActivatedRoute, private router: Router) {}

  toApp(){
    // ONLINE
    window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=http://mms-frontend.s3-website.eu-central-1.amazonaws.com&client_id=850872334166-mr9gaff30197tgou4s9isdogiaq2b0oh.apps.googleusercontent.com"
    
    // OFFLINE
    // window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=http://test.com&client_id=850872334166-mr9gaff30197tgou4s9isdogiaq2b0oh.apps.googleusercontent.com"
  }
}
