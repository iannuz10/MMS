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
  @ViewChild('whiteCanva') whiteCanva!: ElementRef;
  fps!: number;
  isDragging: boolean = false;
  video_height!: number;
  video_width!: number;
  selectedSector!: string;

  frameNumber: number = 0;
  center_x: number = 0;
  center_y: number = 0;
  radius: number = 20;
  // Set the hight to 75% of the screen height

  rect_x! : number ;
  rect_y! : number ;
  rect_w! : number ;
  rect_h! : number ;
  rect_x1! : number ;
  rect_y1! : number ;
  isDraggingRect: boolean = false;
  
  isZooming: boolean = false;
  z_x1!: number;
  z_y1!: number;
  z_x2!: number;
  z_y2!: number;

  framesData: any[] = [];

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

    let contextWhiteCanva = this.whiteCanva.nativeElement.getContext('2d');
    contextWhiteCanva.beginPath();
    contextWhiteCanva.rect(0, 0, w, h);
    contextWhiteCanva.fillStyle = "white";
    contextWhiteCanva.fill();


    console.log("Video width: ", this.videoElement.nativeElement.clientWidth);
    console.log("Video height: ", this.videoElement.nativeElement.clientHeight);

    console.log("Video width: ", this.videoElement.nativeElement.videoWidth);
    console.log("Video height: ", this.videoElement.nativeElement.videoHeight);

    setTimeout(() => {
      let contextCanva = this.canva.nativeElement.getContext('2d');

      console.log("canva transform: ", contextCanva.getTransform());

      // let ratio = w / this.videoElement.nativeElement.videoWidth;
      // console.log("ratio: ", ratio);
      // this.canva.nativeElement.getContext('2d').scale(ratio, ratio);
      console.log("canva transform: ", contextCanva.getTransform());
      
      contextCanva.drawImage(this.videoElement.nativeElement, 0, 0, this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight
        ,0,0, w,h);
    });
  }

  sleepFunc(){

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
      this.isDraggingRect = true;
      this.rect_x = e.offsetX;
      this.rect_y = e.offsetY;
      this.rect_x1 = e.offsetX;
      this.rect_y1 = e.offsetY;
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
      this.isDraggingRect = false;
    }

  }

  zoomIn(){
    this.canva.nativeElement.getContext('2d').clearRect(0, 0, (this.canva.nativeElement.width), (this.canva.nativeElement.height));

    let scale_fac = this.videoElement.nativeElement.videoWidth/this.canva.nativeElement.width;

    let originalRation = this.videoElement.nativeElement.videoWidth/this.videoElement.nativeElement.videoHeight
    let currentRation = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));
    console.log("originalRation",originalRation);
    console.log("currentRation",currentRation);

    this.z_x1*=scale_fac;
    this.z_y1*=scale_fac;
    this.z_x2*=scale_fac;
    this.z_y2*=scale_fac;

    if(currentRation > originalRation){
      let k = this.canva.nativeElement.width / (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2));
      console.log("k: ", k);
      this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,
        Math.min(this.z_x1, this.z_x2),
        Math.min(this.z_y1, this.z_y2),
        (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2)),
        (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2)),
        0, (this.videoElement.nativeElement.clientHeight/2)-((Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2))*k/2), this.canva.nativeElement.width, (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2))*k
      );
    } else {
      let k = this.canva.nativeElement.height / (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));
      console.log("k: ", k);
      this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,
        Math.min(this.z_x1, this.z_x2),
        Math.min(this.z_y1, this.z_y2),
        (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2)),
        (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2)),
        (this.videoElement.nativeElement.clientWidth/2)-((Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))*k/2), 0, (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))*k, this.canva.nativeElement.height
      );
    }
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
    if(this.isZooming){
      let rectWidth = e.offsetX - this.rect_x1;
      let rectHight = e.offsetY - this.rect_y1;
      
      if(rectWidth > 0 && rectHight > 0){
        this.rect_w = rectWidth;
        this.rect_h = rectHight;
      }
      else if(rectWidth < 0 && rectHight > 0){
        this.rect_w = -(rectWidth);
        this.rect_h = rectHight;
        this.rect_x = e.offsetX;
      }
      else if(rectWidth > 0 && rectHight < 0){
        this.rect_w = rectWidth;
        this.rect_h = -(rectHight);
        this.rect_y = e.offsetY;
      }
      else if(rectWidth < 0 && rectHight < 0){
        this.rect_w = -(rectWidth);
        this.rect_h = -(rectHight);
        this.rect_x = e.offsetX;
        this.rect_y = e.offsetY;
      }
    }
  }
  nextFrame(){
    console.log("Frames data: ", this.framesData);
    this.videoElement.nativeElement.currentTime +=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0 ,0 , this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight
      ,0,0, this.video_width,this.video_height);
    this.isZooming = false;
    this.framesData.push({
      x: this.center_x, 
      y: this.center_y,
      r: this.radius
    });
    this.frameNumber++;
  }

  previousFrame(){
    this.videoElement.nativeElement.currentTime -=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0 , this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight
      ,0,0, this.video_width,this.video_height);
    this.isZooming = false;
    this.framesData.pop();
    this.frameNumber--;
  }

  skipFrame(){
    this.videoElement.nativeElement.currentTime +=1/this.fps;
    console.log("current time: ",this.videoElement.nativeElement.currentTime);
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0,0, this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight
      ,0,0, this.video_width,this.video_height);
    this.isZooming = false;
    this.framesData.push({
      x: -1,
      y: -1,
      r: -1
    });
    this.frameNumber++;
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
    console.log("Window resized")
    let h = this.videoElement.nativeElement.clientHeight;
    let w = this.videoElement.nativeElement.clientWidth;
    this.center_x = this.center_x * w / this.video_width;
    this.center_y = this.center_y * h / this.video_height;
    this.video_height = h;
    this.video_width = w;
    
  }

  zoom(){
    this.isZooming = true;
  }

  restoreView(){
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0,0, this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight, 0,0, this.video_width,this.video_height);
  }

  ngOnInit() {
    // You can also initialize the float field in the ngOnInit() method
    this.fps = 20;
  }
}

