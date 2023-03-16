import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import { Event } from '@angular/router';
// import { NavigationStart } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private router: Router) { }

  title = 'MMS';

  isLogged = false;
  token: string | null = null;

  ngOnInit(): void {
    this.checkLogin();
  }

  checkLogin() {
    this.token = localStorage.getItem('authToken');
      if(this.token == null || this.token == 'undefined'){
        this.isLogged = false;
      }
      else{
        this.isLogged = true;
      }
  }

  logOut(){
    if(this.isLogged){
      console.log("Logging out...")
      localStorage.removeItem('authToken');
      this.isLogged = false;
      this.router.navigate(['Login']);
    }
  }

  // constructor(private router: Router){
  //   this.router.events.subscribe((event: Event) => {
  //     console.log(event);
  //     if (event instanceof NavigationStart) {
  //       let url =window.location.href;
  //       // console.log(url);
  //       if (!url.includes('#') && url.includes("Middle")) {
  //         // console.log('ciao');
  //         console.log(window.location.href);
  //         window.location.href = 'http://localhost:4200/#/Middle'
  //         // this.router.navigate(['Middle']);
  //       }
  //     }
  // });
  // }

}
