import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-frame-extractor',
  templateUrl: './frame-extractor.component.html',
  styleUrls: ['./frame-extractor.component.css']
})
export class FrameExtractorComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  fps!: number;
  isDragging: boolean = false;
  video_height!: number;
  video_width!: number;
  selectedSector!: string;

  center_x: number = 0;
  center_y: number = 0;
  radius: number = 20;
  // Set the hight to 75% of the screen height
  
  
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
  }
  mouseDown(e:any){
    // click on the video frame and get the coordinates with respect to the video frame
    console.log("Click coordinates with respect to the video frame: (", e.offsetX, ",", e.offsetY, ")");
    // If the click is inside the circle, then start dragging, otherwise set the circle center to the click coordinates
    if (Math.sqrt( (e.offsetX-this.center_x)*(e.offsetX-this.center_x) + (e.offsetY-this.center_y)*(e.offsetY-this.center_y) ) < this.radius){
      this.isDragging = true;
      console.log("Dragging circle");
    }
    else{
      this.center_x = e.offsetX;
      this.center_y = e.offsetY;
      console.log("Setting circle center to click coordinates");
    }
  }
  mouseUp(e:any){
    this.isDragging = false;
  }
  mouseMove(e:any){
    // Circle must not go out of the video
    if (this.isDragging && this.center_x + e.movementX > 0 && this.center_x + e.movementX < this.video_width && this.center_y + e.movementY > 0 && this.center_y + e.movementY < this.video_height){
      this.center_x = this.center_x + e.movementX;
      this.center_y = this.center_y + e.movementY;
      // this.radius = Math.sqrt( this.cur_center_x*this.cur_center_x +
      //                          this.cur_center_y*this.cur_center_y );
      // console.log("Current radius: (", this.radius, ")");
    }
  }
  nextFrame(){
    this.videoElement.nativeElement.currentTime +=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
  }

  previousFrame(){
    this.videoElement.nativeElement.currentTime -=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
  }

  skipFrame(){
    this.videoElement.nativeElement.currentTime +=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
  }

  onMouseWheelScroll(e:any){
    if (e.deltaY > 0){
      this.radius -= 1;
    }
    else{
      this.radius += 1;
    }
  }



  ngOnInit() {
    // You can also initialize the float field in the ngOnInit() method
    this.fps = 20;
  }
}

