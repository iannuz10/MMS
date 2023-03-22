import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FrameExtractorComponent } from './frame-extractor/frame-extractor.component';
import { LoginComponent } from './login/login.component';
import { MiddleLayerComponent } from './middle-layer/middle-layer.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { CoolSocialLoginButtonsModule } from '@angular-cool/social-login-buttons';
import { MatToolbarModule } from '@angular/material/toolbar';
// import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TaskSelectionComponent } from './task-selection/task-selection.component';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmSubmitDialogComponent } from './confirm-submit-dialog/confirm-submit-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    FrameExtractorComponent,
    LoginComponent,
    MiddleLayerComponent,
    TaskSelectionComponent,
    ConfirmSubmitDialogComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatIconModule,
    CoolSocialLoginButtonsModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatCardModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  // providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
