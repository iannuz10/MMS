import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrameExtractorComponent } from './frame-extractor/frame-extractor.component';
import { LoginComponent } from './login/login.component';
import { MiddleLayerComponent } from './middle-layer/middle-layer.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'Middle', component: MiddleLayerComponent},
  {path: 'MainApp', canActivate:[AuthGuard], component: FrameExtractorComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
