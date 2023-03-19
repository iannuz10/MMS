import { Component, ElementRef, Input, ViewChild, OnDestroy  } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../services/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Mode } from '../Mode-enum';
import { Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmSubmitDialogComponent } from '../confirm-submit-dialog/confirm-submit-dialog.component';

declare var SuperGif: any;
@Component({
  selector: 'app-frame-extractor',
  templateUrl: './frame-extractor.component.html',
  styleUrls: ['./frame-extractor.component.css']
})



export class FrameExtractorComponent {
  @ViewChild('gifElement') gifElement!: ElementRef;
  @ViewChild('videoCanva') canva!: ElementRef;
  @ViewChild('whiteCanva') whiteCanva!: ElementRef;
  @ViewChild('newImg') newImg!: ElementRef;
  @ViewChild('svgElement') svgElement!: ElementRef;
  @ViewChild('skipCanva') skipCanva!: ElementRef;

  // Task type: segmentation or assessment
  task: boolean = true; // false = assessment, true = segmentation

  // Assessment mode
  _mode = Mode;
  base_delay: number = 0;
  delay_multiplier: number = 100;
  video_height!: number;
  video_width!: number;
  selectedSector!: string;
  isVideoPaused: boolean = false;
  sampleQuality!: boolean;
  
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

  // Token for server requests
  token: string | null = null;

  // ONLINE
  // static baseVideoUrl: string = "https://mms-video-storage.s3.eu-central-1.amazonaws.com/videos/"

  // OFFLINE
  static baseVideoUrl: string = "https://mms-video-storage.s3.eu-central-1.amazonaws.com/videos/B-10_0-jSLmRpeC_GIF.gif"

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
  isVideoLoading = true;
  
  // Circle selector and options
  selectorNames: string[] = ['red', 'green', 'blue'];
  selectorColors: string[] = ['red', 'green', 'blue'];
  circleOpacity: any[] = [0.1, 0, 0];
  strokeOpacity: any[] = [1, 0.2, 0.2];
  currentSelector = this.selectorNames[0];
  circleColor = this.selectorColors[0];

  // Progress bar values
  currentProgress: number = 1;
  totalProgress: number = 1;

  // Payload to send to the server
  Payload: any[] = [];

  // Video player
  lastCanvaFrame = new Uint8ClampedArray();
  gif_index:number = 0;
  gif_real_index:number = 0;
  fr_list: any[] = [];
  gif_real_idx_list: number[] = [];
  current_fr!: Uint8ClampedArray;
  gif:any;
  wwidth: number = 0;

  // Frames skipped indeces
  skipped_frames: number[] = [];
  isFrameSkipped: boolean = false;
  toggleFrameSkipped: boolean = false;

  // Dialog submit
  isSubmitted: boolean = false;
  

  constructor(private httpC: HttpService, private router: Router, private snackBar: MatSnackBar, private page: ElementRef, 
              private route: ActivatedRoute, private renderer: Renderer2, public dialog: MatDialog){}

  // ONLINE
  // COMMENTA PER FARLO FUNZIONARE OFFLINE
  ngOnInit() {
    // Get the task type from the URL
    this.route.params.subscribe(params => {
      console.log(params);
      let tempTask = params["id"];
      if (tempTask == "segmentation"){
        this.task = true;
      }
      else if (tempTask == "Assessment"){
        this.task = false;
      }
    });
    
  //   // You can also initialize the float field in the ngOnInit() method
  //   // Check if the user is logged in
  //   this.token = localStorage.getItem('authToken');
  //   if(this.token == null){
  //     console.log("Not Authorized to access the videos");
  //     this.router.navigate(["Login"]);
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
  //       this.router.navigate(["Middle"]);
  //       // Redirects to Google Login that redirects to MiddleComponent
  //       window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=https%3A//www.test.com&client_id=850872334166-mr9gaff30197tgou4s9isdogiaq2b0oh.apps.googleusercontent.com"
  //     }
  //   );
  }

  onImageLoaded(event: any) {
    // Wait for the video to load (?)
    setTimeout(() => {
      if(this.task){
        this.gifElement.nativeElement.setAttribute('rel:auto_play', '0');
      } else{
        this.gifElement.nativeElement.setAttribute('rel:auto_play', '1');
      }
      this.gif = SuperGif({gif:this.gifElement.nativeElement, draw_while_loading:false});
      this.gif.load(function(this:any){
        console.log('oh hey, now the gif is loaded');
        console.log("number of frames",this.gif.get_frames().length)
        this.fr_list = this.gif.get_frames();
        this.base_delay = this.fr_list[0].delay * 10;
        this.gif.get_frames().forEach(function (this:any, element:any){
          if(this.gif_index == 0){
            console.log("First frame")
            this.gif_real_idx_list.push(this.gif_index);
            this.current_fr = element.data.data;
            this.gif_index++;
          }
          else{
            if(!this.areSameFrame(this.current_fr, element.data.data)){
              this.gif_real_idx_list.push(this.gif_index);
              this.current_fr = element.data.data;
            }
            this.gif_index++;
          }
        }.bind(this));
        this.gif_index = 0;
        this.page.nativeElement.querySelectorAll('.jsgif').forEach((element:any) => {
          element.remove();
        });
        this.currentProgress = 1 / this.gif_real_idx_list.length * 100; 
        this.totalProgress = 1 / this.gif_real_idx_list.length * 100;
        this.newImg.nativeElement.width =  this.fr_list[0].data.width;
        this.newImg.nativeElement.height =  this.fr_list[0].data.height;
        this.updateCanvas(0);
        if(!this.task){
          this.animate();
        }else{
          // Get the video height and width of the video
          let h = this.newImg.nativeElement.clientHeight;
          let w = this.newImg.nativeElement.clientWidth;
          this.video_height = h;
          this.video_width = w;
          this.center_y = this.video_height/2;
          this.center_x = this.video_width/2;
          this.radius = Math.min(this.video_height, this.video_width)/10;
          
          this.red_r = this.radius;
          this.green_r = this.radius+20;
          this.blue_r = this.radius+40;
          
          // Set the initial position of the circles
          this.red_x = this.center_x;
          this.red_y = this.center_y;
          this.green_x = this.center_x;
          this.green_y = this.center_y;
          this.blue_x = this.center_x;
          this.blue_y = this.center_y;
          
          // Set a white background to hide the video when zooming
          let contextWhiteCanva = this.whiteCanva.nativeElement.getContext('2d');
          contextWhiteCanva.beginPath();
          contextWhiteCanva.rect(0, 0, w, h);
          contextWhiteCanva.fillStyle = "white";
          contextWhiteCanva.fill();
        }
        this.isVideoLoading = false;
      }.bind(this));
    });
  }

  animate(){
    if(!this.isVideoPaused){
      // console.log(this)
      const mult = 100 / this.delay_multiplier;
      // console.log(mult)
      // console.log(this.base_delay * mult)
      setTimeout(this.animate.bind(this), this.base_delay * mult);
      this.next(Mode.animation);
    }
  }
    
  onBitmapCreate(res:any){
    const ctx = this.newImg.nativeElement.getContext('2d');
    ctx.drawImage(createImageBitmap(this.fr_list[0].data), 0, 0, this.fr_list[0].data.width, this.fr_list[0].data.height)
  }

  updateCanvas(index: number){
    const that = this;
    createImageBitmap(this.fr_list[index].data).then(
      function(bitmap:any){
        // console.log(bitmap)
        // console.log(that)
        const ctx = that.newImg.nativeElement.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)

        if(that.isZoomed){ 
          that.zoomIn();
        }
      }.bind(that)
    ).catch(
      function(error:any){
        console.error(error)
      }.bind(that)
    );
  }

  next(mode:Mode){
    if(this.gif_index == (this.gif_real_idx_list.length - 1)){
      if (mode == Mode.frame_by_frame){
        console.log("sei già all'ultimo frame")
        if(this.task){
          // Ask for confirmation to submit the payload
          this.openDialog();
      }
        return;
      }
      else{
        if(!this.task && !this.isVideoPaused){
          console.log("sei all'ultimo frame, torniamo al primo")
          this.gif_index = 0;
          this.gif_real_index = 0;
        }
      }
    }
    this.gif_index++;
    this.gif_real_index = this.gif_real_idx_list[this.gif_index];
    // this.gif.move_to(this.gif_real_index);
    this.updateCanvas(this.gif_real_index);
  }

  prev(mode:Mode){
    if(this.gif_index == 0){
      if (mode == Mode.frame_by_frame){
        console.log("sei già al primo frame")
        return;
      }
      else{
        console.log("sei al primo frame, torniamo al primo")
        this.gif_index = (this.gif_real_idx_list.length - 1);
        this.gif_real_index = (this.gif_real_idx_list.length - 1);
      }
    }
    this.gif_index--;
    this.gif_real_index = this.gif_real_idx_list[this.gif_index];
    console.log(this.gif_real_index)
    // this.gif.move_to(this.gif_real_index);
    this.updateCanvas(this.gif_real_index);
  }

  areSameFrame(frame1:any, frame2:any): boolean{
    for(let i = 0; i < frame1.length; i++){
      if((frame1[i] - frame2[i]) != 0){
        return false;
      }
    }
    return true;
  }

  prevFrame(){
    // If frame has already been processed, restore the frame data from the payload
    if(this.gif_real_index > 0){
      // If the previous frame was skipped (contained in skipped_frames list), hide the circles
      if(this.skipped_frames.includes(this.gif_real_index-1)){
        this.isFrameSkipped = true;
        this.toggleFrameSkipped = true;
        this.drawFrameSkipOverlay();
      } else {
        this.isFrameSkipped = false;
        this.toggleFrameSkipped = false;
        this.red_x = this.Payload[this.gif_real_index-1].r[0].x;
        this.red_y = this.Payload[this.gif_real_index-1].r[0].y;
        this.red_r = this.Payload[this.gif_real_index-1].r[0].r;
        this.green_x = this.Payload[this.gif_real_index-1].g[0].x;
        this.green_y = this.Payload[this.gif_real_index-1].g[0].y;
        this.green_r = this.Payload[this.gif_real_index-1].g[0].r;
        this.blue_x = this.Payload[this.gif_real_index-1].b[0].x;
        this.blue_y = this.Payload[this.gif_real_index-1].b[0].y;
        this.blue_r = this.Payload[this.gif_real_index-1].b[0].r;
        
        let originalCoef = this.newImg.nativeElement.width/this.video_width;
        
        // Scale the coordinates to the client gif size from the original gif size
        this.red_x = this.red_x / originalCoef;
        this.red_y = this.red_y / originalCoef;
        this.green_x = this.green_x / originalCoef;
        this.green_y = this.green_y / originalCoef;
        this.blue_x = this.blue_x / originalCoef;
        this.blue_y = this.blue_y / originalCoef;
        this.red_r = this.red_r / originalCoef;
        this.green_r = this.green_r / originalCoef;
        this.blue_r = this.blue_r / originalCoef;
        this.onSelectorChange(this.currentSelector);
        if(this.isZoomed){
          this.adaptCirclesZoomIn();
        }
      }
    }
    
    this.isZooming = false;

    this.prev(Mode.frame_by_frame);
    this.currentProgress = (this.gif_real_index+1) / this.fr_list.length * 100;
  }

  nextFrame(){
    // Scale coefficient to original video size
    let originalCoef = this.newImg.nativeElement.width/this.video_width;

    this.isZooming = false;

    // If frame has already been processed, restore the frame data from the payload
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

    if(this.gif_real_index != (this.Payload.length) && this.Payload.length != 0){
      // Update payload for current frame
      this.Payload[this.gif_real_index] = {
        r: maskDataRed, 
        g: maskDataGreen,
        b: maskDataBlue
      };
      // If frame was skipped, remove it from the skipped frames list
      if(this.skipped_frames.includes(this.gif_real_index)){
        this.skipped_frames.splice(this.skipped_frames.indexOf(this.gif_real_index), 1);
      }
    }else{
      // Create payload for current frame
      this.Payload.push({
        r: maskDataRed, 
        g: maskDataGreen,
        b: maskDataBlue
      });
    }

    // Go to next frame
    this.next(Mode.frame_by_frame);

    this.isFrameSkipped = false;
    this.toggleFrameSkipped = false;

    if(this.gif_real_index != (this.Payload.length) && this.Payload.length != 0){
      if(this.skipped_frames.includes(this.gif_real_index)){
        this.isFrameSkipped = true;
        this.toggleFrameSkipped = true;
        this.drawFrameSkipOverlay();
      } else {
        this.isFrameSkipped = false;
        this.toggleFrameSkipped = false;
        this.red_x = this.Payload[this.gif_real_index].r[0].x;
        this.red_y = this.Payload[this.gif_real_index].r[0].y;
        this.red_r = this.Payload[this.gif_real_index].r[0].r;
        this.green_x = this.Payload[this.gif_real_index].g[0].x;
        this.green_y = this.Payload[this.gif_real_index].g[0].y;
        this.green_r = this.Payload[this.gif_real_index].g[0].r;
        this.blue_x = this.Payload[this.gif_real_index].b[0].x;
        this.blue_y = this.Payload[this.gif_real_index].b[0].y;
        this.blue_r = this.Payload[this.gif_real_index].b[0].r;
        
        // Scale the coordinates to the client gif size from the original gif size
        this.red_x = this.red_x / originalCoef;
        this.red_y = this.red_y / originalCoef;
        this.green_x = this.green_x / originalCoef;
        this.green_y = this.green_y / originalCoef;
        this.blue_x = this.blue_x / originalCoef;
        this.blue_y = this.blue_y / originalCoef;
        this.red_r = this.red_r / originalCoef;
        this.green_r = this.green_r / originalCoef;
        this.blue_r = this.blue_r / originalCoef;
        this.onSelectorChange(this.currentSelector);

        if(this.isZoomed){
          this.adaptCirclesZoomIn();
        }
      }
    }

    this.currentProgress = (this.gif_real_index+1) / this.fr_list.length * 100;
    if(this.gif_real_index == this.Payload.length){
      this.totalProgress = this.currentProgress;
    }
  }

  skipFrame(){
    let originalCoef = this.newImg.nativeElement.width/this.video_width;

    this.isZooming = false;

    // Frame skipped -> no selection
    if(this.gif_real_index != (this.Payload.length) && this.Payload.length != 0){
      // Update payload for current frame
      this.Payload[this.gif_real_index] = {
        r: [],
        g: [],
        b: []
      };
    }else{
      // Create payload for current frame
      this.Payload.push({
        r: [],
        g: [],
        b: []
      });
    }

    this.skipped_frames.push(this.gif_real_index);

    // Go to next frame
    this.next(Mode.frame_by_frame);

    // Chakc if frame was already processed
    if(this.gif_real_index != (this.Payload.length) && this.Payload.length != 0){
      if(this.skipped_frames.includes(this.gif_real_index)){
        this.isFrameSkipped = true;
        this.toggleFrameSkipped = true;
        this.drawFrameSkipOverlay();
      } else {
        this.isFrameSkipped = false;
        this.toggleFrameSkipped = false;
        this.red_x = this.Payload[this.gif_real_index].r[0].x;
        this.red_y = this.Payload[this.gif_real_index].r[0].y;
        this.red_r = this.Payload[this.gif_real_index].r[0].r;
        this.green_x = this.Payload[this.gif_real_index].g[0].x;
        this.green_y = this.Payload[this.gif_real_index].g[0].y;
        this.green_r = this.Payload[this.gif_real_index].g[0].r;
        this.blue_x = this.Payload[this.gif_real_index].b[0].x;
        this.blue_y = this.Payload[this.gif_real_index].b[0].y;
        this.blue_r = this.Payload[this.gif_real_index].b[0].r;
        
        // Scale the coordinates to the client gif size from the original gif size
        this.red_x = this.red_x / originalCoef;
        this.red_y = this.red_y / originalCoef;
        this.green_x = this.green_x / originalCoef;
        this.green_y = this.green_y / originalCoef;
        this.blue_x = this.blue_x / originalCoef;
        this.blue_y = this.blue_y / originalCoef;
        this.red_r = this.red_r / originalCoef;
        this.green_r = this.green_r / originalCoef;
        this.blue_r = this.blue_r / originalCoef;
        this.onSelectorChange(this.currentSelector);

        if(this.isZoomed){
          this.adaptCirclesZoomIn();
        }
      }
    }

    this.currentProgress = (this.gif_real_index+1) / this.fr_list.length * 100;
    if(this.gif_real_index == this.Payload.length){
      this.totalProgress = this.currentProgress;
    }
  }


  // -------------------------------------------- Event handlers --------------------------------------------
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
    } else if (this.isZooming && !this.isZoomed && e.srcElement.tagName == "CANVAS"){
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
    if(this.isZooming && !this.isZoomed && e.srcElement.tagName == "CANVAS"){
      this.z_x2 = e.offsetX;
      this.z_y2 = e.offsetY;
      this.zoomIn();
      this.adaptCirclesZoomIn();
      console.log("Zoom coordinate 2: (", e.offsetX, ",", e.offsetY, ")");
      this.isDraggingRect = false;
      this.isZooming = false; 
      this.isZoomed = true;
    }else if(this.isZooming && !this.isZoomed && e.srcElement.tagName != "CANVAS"){
      // Don't do enything if mouse is released outside the video frame
      this.isDraggingRect = false;
      this.isZooming = false;
    }
  }

  mouseMove(e:any){
    // Lines
    // Draw a vertical and a horizontal line that follows the mouse
    // Draw only if the mouse is inside the video frame
    const svgRect = this.svgElement.nativeElement.getBoundingClientRect();
    if (e.clientX < svgRect.left || e.clientX > svgRect.right || e.clientY < svgRect.top || e.clientY > svgRect.bottom) {
      // Mouse is outside the SVG element, hide the lines
      const lines = this.svgElement.nativeElement.querySelectorAll("line");
      for (let i = 0; i < lines.length; i++) {
        this.renderer.setStyle(lines[i], "display", "none");
      }
    } else {
      // Mouse is inside the SVG element, show the lines
      const lines = this.svgElement.nativeElement.querySelectorAll("line");
      for (let i = 0; i < lines.length; i++) {
        this.renderer.setStyle(lines[i], "display", "block");
      }

      // Remove the previous lines from the SVG element
      for (let i = 0; i < lines.length; i++) {
        this.renderer.removeChild(this.svgElement.nativeElement, lines[i]);
      }

      // Add new lines to the SVG element that follow the mouse
      const newHorizontalLine = this.renderer.createElement("line", "svg");
      this.renderer.setAttribute(newHorizontalLine, "x1", "0");
      this.renderer.setAttribute(newHorizontalLine, "y1", String(e.offsetY));
      this.renderer.setAttribute(newHorizontalLine, "x2", String(this.svgElement.nativeElement.clientWidth));
      this.renderer.setAttribute(newHorizontalLine, "y2", String(e.offsetY));
      this.renderer.setAttribute(newHorizontalLine, "stroke", "red");
      this.renderer.setAttribute(newHorizontalLine, "stroke-width", "0.3");
      this.renderer.appendChild(this.svgElement.nativeElement, newHorizontalLine);

      const newVerticalLine = this.renderer.createElement("line", "svg");
      this.renderer.setAttribute(newVerticalLine, "x1", String(e.offsetX));
      this.renderer.setAttribute(newVerticalLine, "y1", "0");
      this.renderer.setAttribute(newVerticalLine, "x2", String(e.offsetX));
      this.renderer.setAttribute(newVerticalLine, "y2", String(this.svgElement.nativeElement.clientHeight));
      this.renderer.setAttribute(newVerticalLine, "stroke", "red");
      this.renderer.setAttribute(newVerticalLine, "stroke-width", "0.3");
      this.renderer.appendChild(this.svgElement.nativeElement, newVerticalLine);
    }

    // Moving circle 
    // Circle must not go out of the video
    if (this.isDragging && this.center_x + e.movementX > 0 && this.center_x + e.movementX < this.video_width && this.center_y + e.movementY > 0 && this.center_y + e.movementY < this.video_height){
      this.onCircleCenterChange(this.center_x + e.movementX, this.center_y + e.movementY);
      // this.center_x = this.center_x + e.movementX;
      // this.center_y = this.center_y + e.movementY;
    }

    // Zoom
    // Drawing rectangle
    if(this.isZooming && !this.isZoomed && e.srcElement.tagName == "CANVAS"){
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
  onWindowResize(e:any){
    console.log("Window resized")
    let h = this.newImg.nativeElement.clientHeight;
    let w = this.newImg.nativeElement.clientWidth;
    this.red_x = this.red_x * w / this.video_width;
    this.red_y = this.red_y * h / this.video_height;
    this.red_r = this.red_r * w / this.video_width;
    this.green_x = this.green_x * w / this.video_width;
    this.green_y = this.green_y * h / this.video_height;
    this.green_r = this.green_r * w / this.video_width;
    this.blue_x = this.blue_x * w / this.video_width;
    this.blue_y = this.blue_y * h / this.video_height;
    this.blue_r = this.blue_r * w / this.video_width;
    this.center_x = this.center_x * w / this.video_width;
    this.center_y = this.center_y * h / this.video_height;
    this.radius = this.radius * w / this.video_width;
    this.video_height = h;
    this.video_width = w;
    if(this.isZoomed){
      this.adaptCirclesZoomOut();
      this.isZoomed = false;
    }
  }

  // Change style of the selected circle and the current selector
  onSelectorChange(currentVal: any){
    this.currentSelector = currentVal

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

  // Open a snackbar with a message
  openSnackBar(toastMessage: string) {
    this.snackBar.open(toastMessage, "Dismiss", {duration:20000});
  }


  // ----------------------------------- ZOOMING AND SCALING-----------------------------------
  // Enable zooming
  zoom(){
      this.isZooming = true;
  }

  // Perform the zooming
  zoomIn(){
    this.canva.nativeElement.getContext('2d').clearRect(0, 0, (this.canva.nativeElement.width), (this.canva.nativeElement.height));

    // Scale factor to scale the coordinates to the showed video size
    let scale_fac = this.newImg.nativeElement.width/this.canva.nativeElement.width;

    // Original and current ratio of the video
    let originalRatio = this.newImg.nativeElement.width/this.newImg.nativeElement.height;
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
      this.canva.nativeElement.getContext('2d').drawImage(this.newImg.nativeElement,
        Math.min(scaledX1, scaledX2),
        Math.min(scaledY1, scaledY2),
        scaledWidth,
        scaledHeight,
        0, (this.canva.nativeElement.clientHeight/2)-(scaledHeight*k/2), this.canva.nativeElement.width, scaledHeight*k
      );
    } else {
      k = this.canva.nativeElement.height / scaledHeight;
      this.canva.nativeElement.getContext('2d').drawImage(this.newImg.nativeElement,
        Math.min(scaledX1, scaledX2),
        Math.min(scaledY1, scaledY2),
        scaledWidth,
        scaledHeight,
        (this.canva.nativeElement.clientWidth/2)-(scaledWidth*k/2), 0, scaledWidth*k, this.canva.nativeElement.height
      );
    }
    // Set a white background to hide the video when zooming (WIP)
    let contextWhiteCanva = this.whiteCanva.nativeElement.getContext('2d');
    contextWhiteCanva.beginPath();
    contextWhiteCanva.rect(0, 0, this.video_width, this.video_height);
    contextWhiteCanva.fillStyle = "white";
    contextWhiteCanva.fill();
  }

  // Go back to full video view
  restoreView(){
    this.canva.nativeElement.getContext('2d').clearRect(0, 0, (this.canva.nativeElement.width), (this.canva.nativeElement.height));
    this.whiteCanva.nativeElement.getContext('2d').clearRect(0, 0, (this.whiteCanva.nativeElement.width), (this.whiteCanva.nativeElement.height));
    this.isZoomed = false;    

    // Place circles in the correct position
    this.adaptCirclesZoomOut();
  }

  // Place the circles in the correct position after zooming in
  adaptCirclesZoomIn(){
    [this.red_x, this.red_y, this.red_r] = this.scaleFront(this.red_x,this.red_y,this.red_r);
    [this.green_x, this.green_y, this.green_r] = this.scaleFront(this.green_x,this.green_y,this.green_r);
    [this.blue_x, this.blue_y, this.blue_r] = this.scaleFront(this.blue_x,this.blue_y,this.blue_r);
    [this.center_x, this.center_y, this.radius] = this.scaleFront(this.center_x,this.center_y,this.radius);
  }

  // Place the circles in the correct position after zooming out
  adaptCirclesZoomOut(){
    [this.red_x, this.red_y, this.red_r] = this.scaleBack(this.red_x,this.red_y,this.red_r);
    [this.green_x, this.green_y, this.green_r] = this.scaleBack(this.green_x,this.green_y,this.green_r);
    [this.blue_x, this.blue_y, this.blue_r] = this.scaleBack(this.blue_x,this.blue_y,this.blue_r);
    [this.center_x, this.center_y, this.radius] = this.scaleBack(this.center_x,this.center_y,this.radius);
  }

  // Calculate the actual position on the client screen of the circle passed as parameter
  scaleBack(X : number, Y : number, R : number){
    // let scale_fac = this.newImg.nativeElement.width/this.canva.nativeElement.width; 

    let originalRatio = this.newImg.nativeElement.clientWidth/this.newImg.nativeElement.clientHeight;
    let currentRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));
    
    let Cy = this.newImg.nativeElement.clientHeight;
    let Cx = this.newImg.nativeElement.clientWidth;

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
    } else {
      console.log("vertical condition");
      let k = Cy / rectHeight;

      let left = (Cx/2) - ((rectWidth/rectHeight)*(Cy/2)); 

      circleCenterX = ((X - left) / k) + minX;
      circleCenterY = (Y / k) + minY;

      circleRadius = R / k;

    }

    return [circleCenterX, circleCenterY, circleRadius];
  }

  scaleFront(X : number, Y : number, R : number){
    // let scale_fac = this.newImg.nativeElement.width/this.canva.nativeElement.width;

    let originalRatio = this.newImg.nativeElement.clientWidth/this.newImg.nativeElement.clientHeight;
    let currentRatio = (Math.max(this.z_x1, this.z_x2) - Math.min(this.z_x1, this.z_x2))/(Math.max(this.z_y1, this.z_y2) - Math.min(this.z_y1, this.z_y2));

    let Cy = this.newImg.nativeElement.clientHeight;
    let Cx = this.newImg.nativeElement.clientWidth;

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

      circleCenterX = ((X - minX) * k);
      circleCenterY = ((Y - minY) * k) + top;

      circleRadius = R * k;

    } else {
      console.log("vertical condition");
      let k = Cy / rectHeight;

      let left = (Cx/2) - ((rectWidth/rectHeight)*(Cy/2));

      circleCenterX = ((X - minX) * k) + left;
      circleCenterY = ((Y - minY) * k);

      circleRadius = R * k;

    }

    return [circleCenterX, circleCenterY, circleRadius];
  }


  // -------------------------------------- SLIDERS ----------------------------------------
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
    this.router.navigate([url]);
  }

  refresh(): void {
    window.location.reload();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmSubmitDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      this.isSubmitted = result;
      console.log('The dialog was closed');
        if(this.isSubmitted){
          if(this.task){
            console.log("Payload: ", this.Payload)
            // Save the mask data API call
            // ONLINE
            // COMMENTA PER FARLO FUNZIONARE OFFLINE
            // this.httpC.postMaskList(this.Payload, this.videoOffset, this.token!).subscribe(data=>{
            //   console.log(data);
            // });
            this.isVideoActive = false;
            this.openSnackBar("Video Finished!!!");
          } else {
            // Insert this.sampleQuality in the payload and send it to the server
            this.Payload.push(this.sampleQuality);
            console.log("Payload: ", this.Payload)
            
            // TODO: SEND THE PAYLOAD TO THE SERVER

            this.isVideoActive = false;
            this.openSnackBar("Task Finished!!!");
            this.isVideoPaused = true;
          }
        }
    });
  }

  drawFrameSkipOverlay(){
    let ctxSkip = this.skipCanva.nativeElement.getContext('2d');
    ctxSkip.clearRect(0, 0, this.video_width, this.video_height);
    ctxSkip.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctxSkip.fillRect(0, 0, this.video_width, this.video_height);
    ctxSkip.fillStyle = 'white';
    ctxSkip.font = 'bold 24px Arial';
    ctxSkip.textAlign = 'center';
    ctxSkip.fillText('Frame Skipped', this.video_width / 2, this.video_height / 2);
  }

  checkIfSkipped(){
    if(this.toggleFrameSkipped){
      this.drawFrameSkipOverlay();
    } else {
      let ctxSkip = this.skipCanva.nativeElement.getContext('2d');
      ctxSkip.clearRect(0, 0, this.video_width, this.video_height);
    }
  }

  // Assessment task functions
  playPause(){
    console.log("Play/Pause");
    console.log("isVideoPaused: ", this.isVideoPaused);
    if(this.isVideoPaused){
      this.isVideoPaused = false;
      this.animate();
    } else {
      this.isVideoPaused = true;
    }
  }

  setGood(){
    this.sampleQuality = true;
    this.openDialog();
  }

  setBad(){
    this.sampleQuality = false;
    this.openDialog();
  }

  ngOnDestroy(){
    // Stop the animation
    this.isVideoActive = false;
    this.isVideoPaused = true;
  }
}
