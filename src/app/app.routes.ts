import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page';


import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CartComponent } from './components/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout';
import { authGuard } from './guards/auth.guard';
import { ProductListComponent } from './components/product-list/product-list';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductListComponent },
  { path: '**', redirectTo: '' }
];

