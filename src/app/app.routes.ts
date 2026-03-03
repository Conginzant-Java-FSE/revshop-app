import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProductListComponent } from './components/products/product-list';
import { ProductDetailComponent } from './components/products/product-detail';
import { CartComponent } from './components/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout';
import { OrderListComponent } from './components/orders/order-list';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile';
import { FavoritesComponent } from './components/favorites/favorites';
import { BuyerDashboardComponent } from './components/dashboard/buyer-dashboard';
import { SellerDashboardComponent } from './components/dashboard/seller-dashboard';
import { ProductAddComponent } from './components/products/product-add';
import { ForgotPasswordComponent } from './components/login/forgot-password';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'buyer-dashboard', component: BuyerDashboardComponent, canActivate: [authGuard] },
  { path: 'seller-dashboard', component: SellerDashboardComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard] },
  { path: 'products/new', component: ProductAddComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

