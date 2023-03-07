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
    // let url = "4%2F0AWtgzh431cll-I_1LAVH_IwKm9fnyqoWR4oTJCBjN7plc3fDTgwX32RW4BuHXcJLcAx2WA"
    // console.log(url);
    // url = decodeURIComponent(url!);
    // console.log(url);
    // console.log(this.h.code);

    // Get the code from the URL 
    this.code = this.route.snapshot.queryParamMap.get('code')!;
    // Decode it
    this.code = decodeURIComponent(this.code!);
    console.log('Code parameter value:', this.code);

    // Calls POST request and saves the token in the localStorage of the Browser
 
    if( localStorage.getItem('authToken') == null  || localStorage.getItem('authToken') == 'undefined' ){
      console.log("Asking for a NEW TOKEN");
      this.h.postToken(this.code!).subscribe(data=>{
        console.log(data);
        console.log(data.id_token);
        localStorage.setItem('authToken', data.id_token);
        console.log('Redirecting to: MainApp');
        this.router.navigate(['MainApp']);
      });
    }
    console.log('Skipping NEW TOKEN');
    console.log('Redirecting to: MainApp');
    this.router.navigate(['MainApp']);
  }

  post(): void{
    this.h.postToken(this.code!).subscribe(data=>{
        console.log(data);
        console.log(data.id_token);
        localStorage.setItem('authToken', data.id_token);
    });
    console.log("fire");
  }
}
