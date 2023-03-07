import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }
  constructor(private router: Router){}
  
  canActivate(): boolean {
    if(localStorage.getItem('authToken') != null && localStorage.getItem('authToken') != 'undefined' ){
      console.log("I have the token");
      // this.router.navigate(["MainApp"]);
      return true;
    }
    else{
      this.router.navigate([""]);
      return false;
    }
  }
}
