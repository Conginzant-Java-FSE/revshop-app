import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private locationService: LocationService
  ) { }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      role: ['BUYER', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    const { role, email, password } = this.loginForm.value;
    const credentials = { email, password };

    if (role === 'SELLER') {
      this.authService.loginSeller(credentials).subscribe({
        next: (res) => {
          const data = res.data || res;
          this.authService.saveAuthData(data.token, data.role, data.userId, data.name);
          this.locationService.clearLocation();
          this.router.navigate(['/']);
        },
        error: (err) => this.handleLoginError(err, credentials, role)
      });
    } else {
      this.authService.loginBuyer(credentials).subscribe({
        next: (res) => {
          const data = res.data || res;
          this.authService.saveAuthData(data.token, data.role, data.userId, data.name);
          this.locationService.clearLocation();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => this.handleLoginError(err, credentials, role)
      });
    }
  }

  handleLoginError(err: any, credentials: any, role: string) {
    const msg = err.error?.message || err.error || '';
    if (typeof msg === 'string' && msg.toLowerCase().includes('inactive')) {
      if (confirm("Your account is deactivated. Would you like to reactivate and log in?")) {
        this.authService.reactivate(credentials).subscribe({
          next: (res) => {
            const data = res.data || res;
            this.authService.saveAuthData(data.token, data.role, data.userId, data.name);
            this.locationService.clearLocation();
            this.router.navigate(role === 'SELLER' ? ['/'] : ['/dashboard']);
          },
          error: (rErr) => {
            this.errorMessage = rErr.error?.message || rErr.error || 'Reactivation failed.';
          }
        });
      }
    } else {
      this.errorMessage = msg || 'Login failed Check your credentials.';
    }
  }
}
