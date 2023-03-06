import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-frame-extractor',
  templateUrl: './frame-extractor.component.html',
  styleUrls: ['./frame-extractor.component.css']
})
export class FrameExtractorComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('videoCanva') canva!: ElementRef;
  fps!: number;
  isDragging: boolean = false;
  video_height!: number;
  video_width!: number;
  selectedSector!: string;

  center_x: number = 0;
  center_y: number = 0;
  radius: number = 20;
  // Set the hight to 75% of the screen height
  
  isZooming: boolean = false;
  z_x1!: number;
  z_y1!: number;
  z_x2!: number;
  z_y2!: number;
  
  onVideoLoaded() {
    // this.videoElement.nativeElement.currentTime = 0;
    console.log(this.canva.nativeElement);
    
    let h = this.videoElement.nativeElement.clientHeight;
    let w = this.videoElement.nativeElement.clientWidth;
    this.video_height = h;
    this.video_width = w;
    this.center_y = this.video_height/2;
    this.center_x = this.video_width/2;
    console.log(h,w);

    console.log("Video width: ", this.videoElement.nativeElement.videoWidth);
    console.log("Video height: ", this.videoElement.nativeElement.videoHeight);

    let contextCanva = this.canva.nativeElement.getContext('2d');

    console.log("canva transform: ", contextCanva.getTransform());

    let ratio = w / this.videoElement.nativeElement.videoWidth;
    contextCanva.scale(ratio, ratio);
    console.log("canva transform: ", contextCanva.getTransform());
    
    contextCanva.drawImage(this.videoElement.nativeElement, 0, 0);

  }
  mouseDown(e:any){
    // click on the video frame and get the coordinates with respect to the video frame
    if(!this.isZooming){
      console.log("Click coordinates with respect to the video frame: (", e.offsetX, ",", e.offsetY, ")");
      console.log("Radius: (", this.radius, ")");
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
    }else{
      this.z_x1 = e.offsetX;
      this.z_y1 = e.offsetY;
      console.log("Zoom coordinate 1: (", e.offsetX, ",", e.offsetY, ")");
    }
  }
  mouseUp(e:any){
    this.isDragging = false;
    if(this.isZooming){
      this.z_x2 = e.offsetX;
      this.z_y2 = e.offsetY;
      this.zoomIn();
      console.log("Zoom coordinate 2: (", e.offsetX, ",", e.offsetY, ")");
    }
  }

  zoomIn(){
    this.canva.nativeElement.getContext('2d').clearRect(0, 0, (this.canva.nativeElement.width)/0.252, (this.canva.nativeElement.height)/0.252);
    console.log("current scale: ", this.canva.nativeElement.getContext('2d').getTransform());

    let maxDim = Math.max((Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2)/0.252), ((Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2))/0.252))
    let zoomRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/((Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2)));
    if((Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/((Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2))) > 1){
      // Horizontal
      let k=this.canva.nativeElement.width / (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2));
      console.log("k: ", k);
      this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,
        Math.min(this.z_x1, this.z_x2)/0.252, 
        Math.min(this.z_y1, this.z_y2)/0.252,
        (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/0.252,
        (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2))/0.252,
        0, 0, this.canva.nativeElement.width/0.252, (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2))*k/0.252
      );
    }else{
      // Vertical
      let k=this.canva.nativeElement.height / (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));
      console.log("k: ", k);
      this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,
        Math.min(this.z_x1, this.z_x2)/0.252, 
        Math.min(this.z_y1, this.z_y2)/0.252,
        (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/0.252,
        (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2))/0.252,
        0, 0, (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))*k/0.252, this.canva.nativeElement.height/0.252
      );
    }
    this.isZooming = false;
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
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0,0);
    this.isZooming = false;
  }

  previousFrame(){
    this.videoElement.nativeElement.currentTime -=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0,0);
    this.isZooming = false;
  }

  skipFrame(){
    this.videoElement.nativeElement.currentTime +=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0,0);
    this.isZooming = false;
  }

  onMouseWheelScroll(e:any){
    if (e.deltaY > 0){
      this.radius -= 1;
    }
    else{
      this.radius += 1;
    }
  }

  onWindowResize(e:any){
    let h = this.videoElement.nativeElement.clientHeight;
    let w = this.videoElement.nativeElement.clientWidth;
    this.video_height = h;
    this.video_width = w;
    this.canva.nativeElement.height = h;
    this.canva.nativeElement.width = w;
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0,0);
  }

  zoom(){
    this.isZooming = true;
  }

  ngOnInit() {
    // You can also initialize the float field in the ngOnInit() method
    this.fps = 20;
  }
}

