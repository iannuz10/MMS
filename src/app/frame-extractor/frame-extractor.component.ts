import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-frame-extractor',
  templateUrl: './frame-extractor.component.html',
  styleUrls: ['./frame-extractor.component.css']
})



export class FrameExtractorComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('videoCanva') canva!: ElementRef;
  @ViewChild('whiteCanva') whiteCanva!: ElementRef;


  video_height!: number;
  video_width!: number;
  selectedSector!: string;
  
  frameNumber: number = 0;
  center_x: number = 0;
  center_y: number = 0;
  radius: number = 60;
  // Set the hight to 75% of the screen height
  
  rect_x! : number ;
  rect_y! : number ;
  rect_w! : number ;
  rect_h! : number ;
  rect_x1! : number ;
  rect_y1! : number ;
  
  z_x1!: number;
  z_y1!: number;
  z_x2!: number;
  z_y2!: number;

  token: string | null = null;
  static baseVideoUrl: string = "https://mms-video-storage.s3.eu-central-1.amazonaws.com/videos/"
  videoUrl: string = FrameExtractorComponent.baseVideoUrl;
  videoOffset: string ="";
  // If I'm dragging the mouse on the canvas
  // Move cirlce
  isDragging: boolean = false;
  // Draw Rectangle
  isDraggingRect: boolean = false;

  // Zoom toggle enabled
  isZooming: boolean = false;
  // If the current Image is Zoomed
  isZoomed: boolean = false;

  // Activates the video player
  isVideoActive = true;

  maskData: any[] = [];

  myFunction(){}

  constructor(private httpC: HttpService, private rotuer: Router, private snackBar: MatSnackBar){}

  ngOnInit() {
    
    // You can also initialize the float field in the ngOnInit() method
    // Check if the user is logged in
    this.token = localStorage.getItem('authToken');
    if(this.token == null){
      console.log("Not Authorized to access the videos");
      this.rotuer.navigate([""]);
    }
    
    // // Get the first video to review
    
    this.httpC.getVideo(localStorage.getItem('authToken')!).subscribe(complete =>
      {
        console.log("Got this video URL: ", complete.body);
        console.log(!complete.body.includes(".mp4"));
        if (!complete.body.includes(".mp4")){
          // All videos reviewd
          this.openSnackBar("All videos have been reviewed!!!");
        }
        this.videoOffset = complete.body;
        this.videoUrl = FrameExtractorComponent.baseVideoUrl + this.videoOffset;
      }
      , error => 
      {
        console.log("Encountered Error: ", error.status);
        localStorage.removeItem('authToken');
        console.log("Redirecting to Authentication Page");
        this.rotuer.navigate(["Middle"]);
        // Redirects to Google Login that redirects to MiddleComponent
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=https%3A//www.test.com&client_id=850872334166-mr9gaff30197tgou4s9isdogiaq2b0oh.apps.googleusercontent.com"
      }
    );
  }

  onVideoLoaded() {
    // Wait for the video to load (?)
    setTimeout(() => {
      
      console.log(this.videoElement.nativeElement);
      
      // Get the video height and width of the video
      let h = this.videoElement.nativeElement.clientHeight;
      let w = this.videoElement.nativeElement.clientWidth;
      this.video_height = h;
      this.video_width = w;
      this.center_y = this.video_height/2;
      this.center_x = this.video_width/2;
      console.log(h,w);

      // Set a white background to hide the video when zooming (WIP)
      let contextWhiteCanva = this.whiteCanva.nativeElement.getContext('2d');
      contextWhiteCanva.beginPath();
      contextWhiteCanva.rect(0, 0, w, h);
      contextWhiteCanva.fillStyle = "white";
      contextWhiteCanva.fill();

      // Necessary to get the firs frame of the video
      this.videoElement.nativeElement.requestVideoFrameCallback(this.doSomethingWithFrame);

      console.log("Video width: ", this.videoElement.nativeElement.clientWidth);
      console.log("Video height: ", this.videoElement.nativeElement.clientHeight);

      console.log("Video width: ", this.videoElement.nativeElement.videoWidth);
      console.log("Video height: ", this.videoElement.nativeElement.videoHeight);
    });
  }

  mouseDown(e:any){
    // Click on the video frame and get the coordinates to move or set the circle
    if(!this.isZooming){
      console.log("Click coordinates with respect to the video frame: (", e.offsetX, ",", e.offsetY, ")");
      console.log("Radius: (", this.radius, ")");
      
      // If the click is inside the circle, then start dragging 
      if (Math.sqrt( (e.offsetX-this.center_x)*(e.offsetX-this.center_x) + (e.offsetY-this.center_y)*(e.offsetY-this.center_y) ) < this.radius){
        this.isDragging = true;
        console.log("Dragging circle");
      } else {
        // set the circle center to the click coordinates
        this.center_x = e.offsetX;
        this.center_y = e.offsetY;
        console.log("Setting circle center to click coordinates");
      }
    } else if (this.isZooming && !this.isZoomed){
      // Zoom
      // Start dragging the rectangle to zoom in
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
    // Stop dragging the circle
    this.isDragging = false;

    // Zoom
    // Stop dragging the rectangle to zoom in
    if(this.isZooming && !this.isZoomed){
      this.z_x2 = e.offsetX;
      this.z_y2 = e.offsetY;
      this.zoomIn();
      console.log("Zoom coordinate 2: (", e.offsetX, ",", e.offsetY, ")");
      this.isDraggingRect = false;
      this.isZooming = false; 
      this.isZoomed = true;
    }
  }

  mouseMove(e:any){
    // Moving circle 
    // Circle must not go out of the video
    if (this.isDragging && this.center_x + e.movementX > 0 && this.center_x + e.movementX < this.video_width && this.center_y + e.movementY > 0 && this.center_y + e.movementY < this.video_height){
      this.center_x = this.center_x + e.movementX;
      this.center_y = this.center_y + e.movementY;
    }
    // Zoom
    // Drawing rectangle
    if(this.isZooming && !this.isZoomed){
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

  zoomIn(){
    this.canva.nativeElement.getContext('2d').clearRect(0, 0, (this.canva.nativeElement.width), (this.canva.nativeElement.height));

    // Scale factor to scale the coordinates to the showed video size
    let scale_fac = this.videoElement.nativeElement.videoWidth/this.canva.nativeElement.width;

    // Original and current ratio of the video
    let originalRatio = this.videoElement.nativeElement.videoWidth/this.videoElement.nativeElement.videoHeight;
    let currentRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));
    
    console.log("originalRatio",originalRatio);
    console.log("currentRatio",currentRatio);

    // Scale the coordinates to the showed video size
    let scaledX1 = this.z_x1 * scale_fac;
    let scaledY1 = this.z_y1 * scale_fac;
    let scaledX2 = this.z_x2 * scale_fac;
    let scaledY2 = this.z_y2 * scale_fac;

    // Width and height of the zoomed area
    let scaledWidth = (Math.max(scaledX1, scaledX2) - Math.min(scaledX1, scaledX2));
    let scaledHeight = (Math.max(scaledY1, scaledY2) - Math.min(scaledY1, scaledY2));

    // Draw the zoomed area
    if(currentRatio > originalRatio){
      let k = this.canva.nativeElement.width / scaledWidth;
      console.log("k: ", k);
      this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,
        Math.min(scaledX1, scaledX2),
        Math.min(scaledY1, scaledY2),
        scaledWidth,
        scaledHeight,
        0, (this.videoElement.nativeElement.clientHeight/2)-(scaledHeight*k/2), this.canva.nativeElement.width, scaledHeight*k
      );
    } else {
      let k = this.canva.nativeElement.height / scaledHeight;
      console.log("k: ", k);
      this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,
        Math.min(scaledX1, scaledX2),
        Math.min(scaledY1, scaledY2),
        scaledWidth,
        scaledHeight,
        (this.videoElement.nativeElement.clientWidth/2)-(scaledWidth*k/2), 0, scaledWidth*k, this.canva.nativeElement.height
      );
    }
  }

  nextFrame(){
    console.log("Frames data: ", this.maskData);
    this.isZooming = false;

    // Scale coefficient to original video size
    let originalCoef = this.videoElement.nativeElement.videoWidth/this.video_width;

    var X = this.center_x;
    var Y = this.center_y;
    var R = this.radius;

    if(this.isZoomed){
      var {X,Y,R} = this.scaleBack(0,0,0);
    }
    

    X *= originalCoef;
    Y *= originalCoef;
    R *= originalCoef;    

    console.log("X: ", X, "\nY: ", Y, "\nR: ", R);

    console.log("original Size: ", this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight);

    // Save selection data
    this.maskData.push({
      x: X, 
      y: Y,
      r: R
    });
    // Go to next frame
    this.videoElement.nativeElement.play();
  }

  skipFrame(){
    console.log("Frames data: ", this.maskData);
    this.isZooming = false;
    // Frame skipped -> no selection
    this.maskData.push({
      x: -1,
      y: -1,
      r: -1
    });
    // Go to next frame
    this.videoElement.nativeElement.play();
  }

  // Change the radius of the circle based on the scroll
  onMouseWheelScroll(e:any){
    if (e.deltaY > 0){
      this.radius -= 1;
    }
    else{
      this.radius += 1;
    }
  }

  // Resize canvas related stuff based on the new window size
  onWindowResize(e:any){
    console.log("Window resized")
    let h = this.videoElement.nativeElement.clientHeight;
    let w = this.videoElement.nativeElement.clientWidth;
    this.center_x = this.center_x * w / this.video_width;
    this.center_y = this.center_y * h / this.video_height;
    this.radius = this.radius * w / this.video_width;
    this.video_height = h;
    this.video_width = w;
    this.isZoomed = false;
  }

  // Enable zooming
  zoom(){
      this.isZooming = true;
  }

  // Go back to full video view
  restoreView(){
    this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,0,0, this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight, 0,0, this.video_width,this.video_height);
    this.isZoomed = false;
  }

  // Frame by frame callback
  doSomethingWithFrame = (now:any, metadata:any) =>{
    console.log(metadata.presentedFrames);
    this.videoElement.nativeElement.requestVideoFrameCallback(this.doSomethingWithFrame);
    this.videoElement.nativeElement.pause();
    let contextCanva = this.canva.nativeElement.getContext('2d');
    
    contextCanva.drawImage(this.videoElement.nativeElement, 0, 0, this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight
      ,0,0, this.video_width,this.video_height);
    
    // If previous frame was zoomed, zoom also the current one
    if(this.isZoomed){ 
      this.zoomIn();
    }
    // Set a white background to hide the video when zooming (WIP)
    let contextWhiteCanva = this.whiteCanva.nativeElement.getContext('2d');
    contextWhiteCanva.beginPath();
    contextWhiteCanva.rect(0, 0, this.video_width, this.video_height);
    contextWhiteCanva.fillStyle = "white";
    contextWhiteCanva.fill();
  }

  // Video ended callback
  videoEnded(e:any){
    console.log("Video Ended");
    this.openSnackBar("Video Finished!!!");
    // Save the mask data API call
    this.httpC.postMaskList(this.maskData, this.videoOffset, this.token!).subscribe(data=>{
      console.log(data);
    });
    this.isVideoActive = false;
  // console.log("fire");
  }

  openSnackBar(toastMessage: string) {
    this.snackBar.open(toastMessage, "Dismiss", {duration:20000});
  }

  scaleBack(X : number, Y : number, R : number){
    // let scale_fac = this.videoElement.nativeElement.videoWidth/this.canva.nativeElement.width; 

    let originalRatio = this.videoElement.nativeElement.clientWidth/this.videoElement.nativeElement.clientHeight;
    let currentRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));
    

    let Cy = this.videoElement.nativeElement.clientHeight;
    let Cx = this.videoElement.nativeElement.clientWidth;

    let minX = this.z_x1;
    let minY = this.z_y1;

    let rectWidth = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2));
    let rectHeight = (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));

    let circleCenterX;
    let circleCenterY;
    let circleRadius;

    if(originalRatio < currentRatio){
      console.log("horizontal condition");

      let k = Cx / rectWidth;

      let top = (Cy/2) - ((rectHeight/rectWidth)*(Cx/2)); 

      circleCenterX = (this.center_x / k) + minX;
      circleCenterY = ((this.center_y - top) / k) + minY;

      circleRadius = this.radius / k;

      console.log("Circle center: ", circleCenterX, circleCenterY);
      console.log("Circle radius: ", circleRadius);
    } else {
      console.log("vertical condition");
      let k = Cy / rectHeight;

      let left = (Cx/2) - ((rectWidth/rectHeight)*(Cy/2)); 

      circleCenterX = ((this.center_x - left) / k) + minX;
      circleCenterY = (this.center_y / k) + minY;

      circleRadius = this.radius / k;

      console.log("Circle center: ", circleCenterX, circleCenterY);
      console.log("Circle radius: ", circleRadius);
    }

    // Scale the circle center and radius to the original video size
    X = circleCenterX;
    Y = circleCenterY;
    R = circleRadius;

    return {X, Y, R};
  }

  navigateTo(url:string){
    console.log("Navigating to:", url);
    this.rotuer.navigate([url]);
  }
}
