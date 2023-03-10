import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrameExtractorComponent } from './frame-extractor/frame-extractor.component';
import { LoginComponent } from './login/login.component';
import { MiddleLayerComponent } from './middle-layer/middle-layer.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {path: 'Login', component: LoginComponent},
  {path: '', component: MiddleLayerComponent},
  {path: 'MainApp',  component: FrameExtractorComponent}, // OFFLINE
  // {path: 'MainApp', canActivate:[AuthGuard], component: FrameExtractorComponent}, // ONLINE
  {path: '**', component: MiddleLayerComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
