import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
    private router: Router
  ) { }

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
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.error || 'Login failed Check your credentials.';
        }
      });
    } else {
      this.authService.loginBuyer(credentials).subscribe({
        next: (res) => {
          const data = res.data || res;
          this.authService.saveAuthData(data.token, data.role, data.userId, data.name);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.error || 'Login failed Check your credentials.';
        }
      });
    }
  }
}
