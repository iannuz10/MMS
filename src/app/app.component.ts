import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MMS';

  constructor(private route: ActivatedRoute, private router: Router) {}

  toApp(){
    this.router.navigate(['MainApp'], { relativeTo: this.route });
  }
}
