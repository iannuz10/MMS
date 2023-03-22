import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-middle-layer',
  templateUrl: './middle-layer.component.html',
  styleUrls: ['./middle-layer.component.css']
})
export class MiddleLayerComponent implements OnInit{

  code!:string|null;

  constructor(private h:HttpService, private route: ActivatedRoute, private router: Router) {
    
  }

  ngOnInit(): void {
    // Get the code from the URL 
    console.log(window.location.href);
    this.code = this.route.snapshot.queryParamMap.get('code')!;

    this.code = decodeURIComponent(this.code!);
    console.log('Code parameter value:', this.code);

    // Calls POST request and saves the token in the localStorage of the Browser
    if( localStorage.getItem('authToken') == null  || localStorage.getItem('authToken') == 'undefined' ){
      console.log("Asking for a NEW TOKEN");
      this.h.postToken(this.code!).subscribe(
        {
          next: (v) => {
            console.log("Token response Code:", v.statusCode);
            if(v.statusCode != 500){
              console.log("Valid token:", v.id_token);
              localStorage.setItem('authToken', v.id_token);
              console.log("Redirect to: TaskSelection");
              this.router.navigate(['TaskSelection']);
            }
            else{
              console.log("Invalid token:", v.id_token);
              console.log("Redirect to: Login");
              this.router.navigate(['Login']);
            }
          },
        error: (e) => console.error(e),
        complete: () => console.info('complete')}
      );
      return;
    }
    console.log('Skipping NEW TOKEN');
    console.log('Redirecting to: TaskSelection');
    this.router.navigate(['TaskSelection']);
  }
}
