import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-frame-extractor',
  templateUrl: './frame-extractor.component.html',
  styleUrls: ['./frame-extractor.component.css']
})
export class FrameExtractorComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  fps!: number;
  isDragging: boolean = false;
  center_x: number = 0;
  center_y: number = 0;
  radius: number = 20;
  cur_center_x: number = 0;
  cur_center_y: number = 0;
  video_height: number = 400;
  video_width: number = 720;
  
  onVideoLoaded() {

    // console.log(this.videoElement.nativeElement.currentTime);
    // this.videoElement.nativeElement.currentTime =0;
    let h = this.videoElement.nativeElement.clientHeight;
    let w = this.videoElement.nativeElement.clientWidth;
    this.video_height = h;
    this.video_width = w;
    this.center_y = this.video_height/2;
    this.center_x = this.video_width/2;
    console.log(h,w);
    // this.nextFrame()
    
  }
  mouseDown(e:any){
    console.log("ciao")
    // console.log(e.clientX);
    this.center_x = e.clientX;
    this.center_y = e.clientY;
    console.log("New center: (", this.center_x, ", ", this.center_y, ")");
    this.isDragging = true;
  }
  mouseUp(e:any){
    this.isDragging = false;
  }
  mouseMove(e:any){
    if (this.isDragging){
      this.cur_center_x = e.clientX - this.center_x;
      this.cur_center_y = e.clientY - this.center_y;
      this.radius = Math.sqrt( this.cur_center_x*this.cur_center_x +
                               this.cur_center_y*this.cur_center_y );
      // console.log("Current radius: (", this.radius, ")");
    }
  }
  nextFrame(){
    this.videoElement.nativeElement.currentTime +=1;
    console.log(this.videoElement.nativeElement.currentTime);
    console.log(this.videoElement.nativeElement.duration);
    console.log(this.videoElement.nativeElement);
  }

  previousFrame(){
    this.videoElement.nativeElement.currentTime -=1/this.fps;
  }

  ngOnInit() {
    // You can also initialize the float field in the ngOnInit() method
    this.fps = 20;
  }
}

