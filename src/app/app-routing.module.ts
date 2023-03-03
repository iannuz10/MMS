import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrameExtractorComponent } from './frame-extractor/frame-extractor.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'MainApp', component: FrameExtractorComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
