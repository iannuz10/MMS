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
  
  // Current circle position
  center_x: number = 0;
  center_y: number = 0;
  radius: number = 60;

  // Circles values
  red_x: number = this.center_x;
  red_y: number = this.center_y;
  red_r: number = this.radius;
  green_x: number = this.center_x;
  green_y: number = this.center_y;
  green_r: number = this.radius+20;
  blue_x: number = this.center_x;
  blue_y: number = this.center_y;
  blue_r: number = this.radius+40;
  
  // Rectangle vertices
  rect_x! : number ;
  rect_y! : number ;
  rect_w! : number ;
  rect_h! : number ;
  // Necessary to draw the rectangle
  rect_x1! : number ; 
  rect_y1! : number ;
  
  // Zoom rectangle vertices
  z_x1!: number;
  z_y1!: number;
  z_x2!: number;
  z_y2!: number;

  token: string | null = null;

  // ONLINE
  // static baseVideoUrl: string = "https://mms-video-storage.s3.eu-central-1.amazonaws.com/videos/"

  // OFFLINE
  static baseVideoUrl: string = "https://mms-video-storage.s3.eu-central-1.amazonaws.com/videos/B-10.0-jSLmRpeC.mp4"
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

  // Index of the membrane selector toggles
  
  selectorNames: string[] = ['red', 'green', 'blue'];
  selectorColors: string[] = ['red', 'green', 'blue'];
  circleOpacity: any[] = [0.1, 0, 0];
  strokeOpacity: any[] = [1, 0.2, 0.2];
  
  currentSelector = this.selectorNames[0];
  circleColor = this.selectorColors[0];

  // Current frame number
  currentProgress: number = 1;

  // Payload to send to the server
  Payload: any[] = [];

  currentTime: number = 0;

  constructor(private httpC: HttpService, private rotuer: Router, private snackBar: MatSnackBar){}

  // ONLINE
  // COMMENTA PER FARLO FUNZIONARE OFFLINE
  // ngOnInit() {
    
  //   // You can also initialize the float field in the ngOnInit() method
  //   // Check if the user is logged in
  //   this.token = localStorage.getItem('authToken');
  //   if(this.token == null){
  //     console.log("Not Authorized to access the videos");
  //     this.rotuer.navigate(["Login"]);
  //   }
    
  //   // // Get the first video to review
    
  //   this.httpC.getVideo(localStorage.getItem('authToken')!).subscribe(complete =>
  //     {
  //       console.log("Got this video URL: ", complete.body);
  //       console.log(!complete.body.includes(".mp4"));
  //       if (!complete.body.includes(".mp4")){
  //         // All videos reviewd
  //         this.openSnackBar("All videos have been reviewed!!!");
  //       }
  //       this.videoOffset = complete.body;
  //       this.videoUrl = FrameExtractorComponent.baseVideoUrl + this.videoOffset;
  //     }
  //     , error => 
  //     {
  //       console.log("Encountered Error: ", error.status);
  //       localStorage.removeItem('authToken');
  //       console.log("Redirecting to Authentication Page");
  //       this.rotuer.navigate(["Middle"]);
  //       // Redirects to Google Login that redirects to MiddleComponent
  //       window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=https%3A//www.test.com&client_id=850872334166-mr9gaff30197tgou4s9isdogiaq2b0oh.apps.googleusercontent.com"
  //     }
  //   );
  // }

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
      this.radius = Math.min(this.video_height, this.video_width)/10;
      
      this.red_r = this.radius;
      this.green_r = this.radius+20;
      this.blue_r = this.radius+40;

      console.log("Center: ",this.center_x, this.center_y)

      // Set the initial position of the circles
      this.red_x = this.center_x;
      this.red_y = this.center_y;
      this.green_x = this.center_x;
      this.green_y = this.center_y;
      this.blue_x = this.center_x;
      this.blue_y = this.center_y;

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

  // Change style of the selected circle and the current selector
  onSelectorChange(currentVal: any){
    this.currentSelector = currentVal
    console.log("Current Selector:", this.currentSelector);

    switch(this.currentSelector){
      case this.selectorNames[0]:
        this.circleColor=this.selectorColors[0];
        this.center_x = this.red_x;
        this.center_y = this.red_y;
        this.radius = this.red_r;
        this.circleOpacity = [0.1, 0, 0];
        this.strokeOpacity = [1, 0.2, 0.2];
        break;
      case this.selectorNames[1]:
        this.circleColor=this.selectorColors[1];
        this.center_x = this.green_x;
        this.center_y = this.green_y;
        this.radius = this.green_r;
        this.circleOpacity = [0, 0.1, 0];
        this.strokeOpacity = [0.2, 1, 0.2];
        break;
      case this.selectorNames[2]:
        this.circleColor=this.selectorColors[2];
        this.center_x = this.blue_x;
        this.center_y = this.blue_y;
        this.radius = this.blue_r;
        this.circleOpacity = [0, 0, 0.1];
        this.strokeOpacity = [0.2, 0.2, 1];
        break;
    }
   }

  // Change only the selected circle's radius
   onCircleRadiusChange(currentVal: any){
    switch(this.currentSelector){
      case this.selectorNames[0]:
        this.red_r = currentVal;
        this.radius = this.red_r;
        break;
      case this.selectorNames[1]:
        this.green_r = currentVal;
        this.radius = this.green_r;
        break;
      case this.selectorNames[2]:
        this.blue_r = currentVal;
        this.radius = this.blue_r;
        break;
    }
  }

  // Change only the selected circle's center
  onCircleCenterChange(currentValX: any, currentValY: any){
    switch(this.currentSelector){
      case this.selectorNames[0]:
        this.red_x = currentValX;
        this.red_y = currentValY;
        this.center_x = this.red_x;
        this.center_y = this.red_y;
        break;
      case this.selectorNames[1]:
        this.green_x = currentValX;
        this.green_y = currentValY;
        this.center_x = this.green_x;
        this.center_y = this.green_y;
        break;
      case this.selectorNames[2]:
        this.blue_x = currentValX;
        this.blue_y = currentValY;
        this.center_x = this.blue_x;
        this.center_y = this.blue_y;
        break;
    }
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
        this.onCircleCenterChange(e.offsetX, e.offsetY);
        this.isDragging = true;
        // this.center_x = e.offsetX;
        // this.center_y = e.offsetY;
        console.log("Setting circle center to click coordinates");
      }
    } else if (this.isZooming && !this.isZoomed && e.srcElement.tagName == "VIDEO"){
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
    if(this.isZooming && !this.isZoomed && e.srcElement.tagName == "VIDEO"){
      this.z_x2 = e.offsetX;
      this.z_y2 = e.offsetY;
      this.zoomIn();
      this.adaptCirclesZoomIn();
      console.log("Zoom coordinate 2: (", e.offsetX, ",", e.offsetY, ")");
      this.isDraggingRect = false;
      this.isZooming = false; 
      this.isZoomed = true;
    }else if(this.isZooming && !this.isZoomed && e.srcElement.tagName != "VIDEO"){
      // Don't do enything if mouse is released outside the video frame
      this.isDraggingRect = false;
      this.isZooming = false;
    }
  }

  mouseMove(e:any){
    // Moving circle 
    // Circle must not go out of the video
    if (this.isDragging && this.center_x + e.movementX > 0 && this.center_x + e.movementX < this.video_width && this.center_y + e.movementY > 0 && this.center_y + e.movementY < this.video_height){
      this.onCircleCenterChange(this.center_x + e.movementX, this.center_y + e.movementY);
      // this.center_x = this.center_x + e.movementX;
      // this.center_y = this.center_y + e.movementY;
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

    let k: number;

    // Draw the zoomed area
    if(currentRatio > originalRatio){
      k = this.canva.nativeElement.width / scaledWidth;
      console.log("k: ", k);
      this.canva.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement,
        Math.min(scaledX1, scaledX2),
        Math.min(scaledY1, scaledY2),
        scaledWidth,
        scaledHeight,
        0, (this.videoElement.nativeElement.clientHeight/2)-(scaledHeight*k/2), this.canva.nativeElement.width, scaledHeight*k
      );
    } else {
      k = this.canva.nativeElement.height / scaledHeight;
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
    // console.log("Frames data: ", this.maskData);
    this.isZooming = false;

    // Scale coefficient to original video size
    let originalCoef = this.videoElement.nativeElement.videoWidth/this.video_width;

    // Sectors data to send to the server
    let maskDataRed: any[] = [];
    let maskDataGreen: any[] = [];
    let maskDataBlue: any[] = [];

    // Current frame data
    let redX = this.red_x;
    let redY = this.red_y;
    let redR = this.red_r;
    let greenX = this.green_x;
    let greenY = this.green_y;
    let greenR = this.green_r;
    let blueX = this.blue_x;
    let blueY = this.blue_y;
    let blueR = this.blue_r;
    
    // Scale the coordinates to the client video size if the video is zoomed
    if(this.isZoomed){
      [redX, redY, redR] = this.scaleBack(this.red_x,this.red_y,this.red_r);
      [greenX, greenY, greenR] = this.scaleBack(this.green_x,this.green_y,this.green_r);
      [blueX, blueY, blueR] = this.scaleBack(this.blue_x,this.blue_y,this.blue_r);
    }
    
    // Scale the coordinates to the original video size
    redX *= originalCoef;
    redY *= originalCoef;
    redR *= originalCoef;    
    greenX *= originalCoef;
    greenY *= originalCoef;
    greenR *= originalCoef;
    blueX *= originalCoef;
    blueY *= originalCoef;
    blueR *= originalCoef;

    // Round the coordinates to 2 decimal places
    redX.toFixed(2);
    redY.toFixed(2);
    redR.toFixed(2);    
    greenX.toFixed(2);
    greenY.toFixed(2);
    greenR.toFixed(2);
    blueX.toFixed(2);
    blueY.toFixed(2);
    blueR.toFixed(2);

    // Save the coordinates
    maskDataRed.push({
      x: redX,
      y: redY,
      r: redR
    });
    maskDataGreen.push({
      x: greenX,
      y: greenY,
      r: greenR
    });
    maskDataBlue.push({
      x: blueX,
      y: blueY,
      r: blueR
    });

    // Create payload for current frame
    this.Payload.push({
      r: maskDataRed, 
      g: maskDataGreen,
      b: maskDataBlue
    });
    // Go to next frame
    console.log("Time at play: ", this.videoElement.nativeElement.currentTime);
    this.currentTime = this.videoElement.nativeElement.currentTime;
    this.videoElement.nativeElement.play();
    this.currentProgress = Math.trunc( (this.videoElement.nativeElement.currentTime / this.videoElement.nativeElement.duration) * 100) + 2;
    console.log("currentProgress:", this.currentProgress);
  }

  skipFrame(){
    this.isZooming = false;
    // Frame skipped -> no selection
    this.Payload.push({
      r: [-1],
      g: [-1],
      b: [-1]
    });
    // Go to next frame
    this.videoElement.nativeElement.play();
  }

  // Change the radius of the circle based on the scroll
  onMouseWheelScroll(e:any){
    if (e.deltaY > 0){
      this.onCircleRadiusChange(this.radius - 1);
      // this.radius -= 1;
    }
    else{
      this.onCircleRadiusChange(this.radius + 1);
      // this.radius += 1;
    }
  }

  // Resize canvas related stuff based on the new window size
  // TODO: Fix the bug when the window is resized while zooming
  onWindowResize(e:any){
    console.log("Window resized")
    let h = this.videoElement.nativeElement.clientHeight;
    let w = this.videoElement.nativeElement.clientWidth;
    this.red_x = this.red_x * w / this.video_width;
    this.red_y = this.red_y * h / this.video_height;
    this.red_r = this.red_r * w / this.video_width;
    this.green_x = this.green_x * w / this.video_width;
    this.green_y = this.green_y * h / this.video_height;
    this.green_r = this.green_r * w / this.video_width;
    this.blue_x = this.blue_x * w / this.video_width;
    this.blue_y = this.blue_y * h / this.video_height;
    this.blue_r = this.blue_r * w / this.video_width;
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

    // Place circles in the correct position
    this.adaptCirclesZoomOut();
  }

  // Frame by frame callback
  doSomethingWithFrame = (now:any, metadata:any) =>{
    console.log(metadata.presentedFrames);

    
    
    this.videoElement.nativeElement.requestVideoFrameCallback(this.doSomethingWithFrame);
    this.videoElement.nativeElement.pause();
    let timeElapsed: number;
    if(this.currentTime == 0)
      timeElapsed = this.videoElement.nativeElement.currentTime;
    else
      timeElapsed = this.videoElement.nativeElement.currentTime - this.currentTime;
    console.log("Time elapsed: ", timeElapsed)
    if(timeElapsed < 0.05){
      console.log("Something went wrong, skipping frame")
      this.videoElement.nativeElement.play();
    }
    console.log("Time at pause: ", this.videoElement.nativeElement.currentTime);

    let contextCanva = this.canva.nativeElement.getContext('2d');
    
    contextCanva.drawImage(this.videoElement.nativeElement, 0, 0, this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight
      ,0,0, this.video_width,this.video_height);
    
    // If previous frame was zoomed, zoom also the current one
    if(this.isZoomed){ 
      this.zoomIn();
    }

    // Set a white background to hide the video when zooming
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
    // ONLINE
    // COMMENTA PER FARLO FUNZIONARE OFFLINE
    // this.httpC.postMaskList(this.Payload, this.videoOffset, this.token!).subscribe(data=>{
    //   console.log(data);
    // });
    this.isVideoActive = false;
  // console.log("fire");
  }

  // Open a snackbar with a message
  openSnackBar(toastMessage: string) {
    this.snackBar.open(toastMessage, "Dismiss", {duration:20000});
  }

  // Place the circles in the correct position after zooming in
  adaptCirclesZoomIn(){
    let originalRatio = this.videoElement.nativeElement.clientWidth/this.videoElement.nativeElement.clientHeight;
    let currentRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));

    let Cy = this.videoElement.nativeElement.clientHeight;
    let Cx = this.videoElement.nativeElement.clientWidth;

    let minX = Math.min(this.z_x1, this.z_x2);
    let minY = Math.min(this.z_y1, this.z_y2);

    let rectWidth = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2));
    let rectHeight = (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));

    if (originalRatio > currentRatio){
      let k = Cx / rectWidth;
      let top = (Cy/2) - ((rectHeight/rectWidth)*(Cx/2)); 
      let scale_fac = originalRatio/currentRatio;

      this.red_x = (this.red_x - minX)*k;
      this.red_y = (this.red_y - minY)*k + top;
      this.red_r = this.red_r*k/scale_fac;
      this.green_x = (this.green_x - minX)*k;
      this.green_y = (this.green_y - minY)*k + top;
      this.green_r = this.green_r*k/scale_fac;
      this.blue_x = (this.blue_x - minX)*k;
      this.blue_y = (this.blue_y - minY)*k + top;
      this.blue_r = this.blue_r*k/scale_fac;
    }
    else{
      let k = Cy / rectHeight;
      let left = (Cx/2) - ((rectWidth/rectHeight)*(Cy/2));
      let scale_fac = currentRatio/originalRatio;

      this.red_x = (this.red_x - minX)*k + left;
      this.red_y = (this.red_y - minY)*k;
      this.red_r = this.red_r*k/scale_fac;
      this.green_x = (this.green_x - minX)*k + left;
      this.green_y = (this.green_y - minY)*k;
      this.green_r = this.green_r*k/scale_fac;
      this.blue_x = (this.blue_x - minX)*k + left;
      this.blue_y = (this.blue_y - minY)*k;
      this.blue_r = this.blue_r*k/scale_fac;
    }
  }

  // Place the circles in the correct position after zooming out
  adaptCirclesZoomOut(){
    let originalRatio = this.videoElement.nativeElement.clientWidth/this.videoElement.nativeElement.clientHeight;
    let currentRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));

    let Cy = this.videoElement.nativeElement.clientHeight;
    let Cx = this.videoElement.nativeElement.clientWidth;

    let minX = Math.min(this.z_x1, this.z_x2);
    let minY = Math.min(this.z_y1, this.z_y2);

    let rectWidth = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2));
    let rectHeight = (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));

    if (originalRatio > currentRatio){
      let k = Cx / rectWidth;
      let top = (Cy/2) - ((rectHeight/rectWidth)*(Cx/2));
      let scale_fac = originalRatio/currentRatio;

      this.red_x = (this.red_x)/k + minX;
      this.red_y = (this.red_y - top)/k + minY;
      this.red_r = this.red_r/k*scale_fac;
      this.green_x = (this.green_x)/k + minX;
      this.green_y = (this.green_y - top)/k + minY;
      this.green_r = this.green_r/k*scale_fac;
      this.blue_x = (this.blue_x)/k + minX;
      this.blue_y = (this.blue_y - top)/k + minY;
      this.blue_r = this.blue_r/k*scale_fac;
    }
    else{
      let k = Cy / rectHeight;
      let left = (Cx/2) - ((rectWidth/rectHeight)*(Cy/2));
      let scale_fac = currentRatio/originalRatio;

      this.red_x = (this.red_x - left)/k + minX;
      this.red_y = (this.red_y)/k + minY;
      this.red_r = this.red_r/k*scale_fac;
      this.green_x = (this.green_x - left)/k + minX;
      this.green_y = (this.green_y)/k + minY;
      this.green_r = this.green_r/k*scale_fac;
      this.blue_x = (this.blue_x - left)/k + minX;
      this.blue_y = (this.blue_y)/k + minY;
      this.blue_r = this.blue_r/k*scale_fac;
    }
  }

  // Calculate the actual position on the client screen of the circle passed as parameter
  scaleBack(X : number, Y : number, R : number){
    // let scale_fac = this.videoElement.nativeElement.videoWidth/this.canva.nativeElement.width; 

    let originalRatio = this.videoElement.nativeElement.clientWidth/this.videoElement.nativeElement.clientHeight;
    let currentRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));
    
    let Cy = this.videoElement.nativeElement.clientHeight;
    let Cx = this.videoElement.nativeElement.clientWidth;

    let minX = Math.min(this.z_x1, this.z_x2);
    let minY = Math.min(this.z_y1, this.z_y2);

    let rectWidth = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2));
    let rectHeight = (Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));

    let circleCenterX;
    let circleCenterY;
    let circleRadius;

    if(originalRatio < currentRatio){
      console.log("horizontal condition");

      let k = Cx / rectWidth;

      let top = (Cy/2) - ((rectHeight/rectWidth)*(Cx/2)); 

      circleCenterX = (X / k) + minX;
      circleCenterY = ((Y - top) / k) + minY;

      circleRadius = R / k;

      console.log("Circle center: ", circleCenterX, circleCenterY);
      console.log("Circle radius: ", circleRadius);
    } else {
      console.log("vertical condition");
      let k = Cy / rectHeight;

      let left = (Cx/2) - ((rectWidth/rectHeight)*(Cy/2)); 

      circleCenterX = ((X - left) / k) + minX;
      circleCenterY = (Y / k) + minY;

      circleRadius = R / k;

      console.log("Circle center: ", circleCenterX, circleCenterY);
      console.log("Circle radius: ", circleRadius);
    }

    return [circleCenterX, circleCenterY, circleRadius];
  }

  // Change current selected circle's radius
  onSliderRadiusChange(){
    switch(this.currentSelector){
      case this.selectorNames[0]:
        this.red_r = this.radius;
        break;
      case this.selectorNames[1]:
        this.green_r = this.radius;
        break;
      case this.selectorNames[2]:
        this.blue_r = this.radius;
        break;
    }
  }

  // Change current selected circle's X position
  onSliderXChange(){
    switch(this.currentSelector){
      case this.selectorNames[0]:
        this.red_x = this.center_x;
        break;
      case this.selectorNames[1]:
        this.green_x = this.center_x;
        break;
      case this.selectorNames[2]:
        this.blue_x = this.center_x;
        break;
    }
  }

  // Change current selected circle's Y position
  onSliderYChange(){
    switch(this.currentSelector){
      case this.selectorNames[0]:
        this.red_y = this.center_y;
        break;
      case this.selectorNames[1]:
        this.green_y = this.center_y;
        break;
      case this.selectorNames[2]:
        this.blue_y = this.center_y;
        break;
    }
  }

  navigateTo(url:string){
    console.log("Navigating to:", url);
    this.rotuer.navigate([url]);
  }
}
