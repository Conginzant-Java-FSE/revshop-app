import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page';


import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
