import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSeller: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  otpSent: boolean = false;
  otpVerified: boolean = false;
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private toastService: ToastService
  ) { }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      role: ['BUYER', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
      ]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', Validators.required],
      businessName: [''],
      taxId: [''],
      businessDescription: [''],
      otp: ['']
    });

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.isSeller = role === 'SELLER';
      this.updateSellerValidations();
    });
  }

  updateSellerValidations() {
    const businessNameControl = this.registerForm.get('businessName');
    const taxIdControl = this.registerForm.get('taxId');
    const descControl = this.registerForm.get('businessDescription');

    if (this.isSeller) {
      businessNameControl?.setValidators([Validators.required]);
      taxIdControl?.setValidators([Validators.required]);
      descControl?.setValidators([Validators.required]);
    } else {
      businessNameControl?.clearValidators();
      taxIdControl?.clearValidators();
      descControl?.clearValidators();
    }

    businessNameControl?.updateValueAndValidity();
    taxIdControl?.updateValueAndValidity();
    descControl?.updateValueAndValidity();
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    if (!this.otpSent) {
      this.loading = true;
      this.authService.sendOtp(this.registerForm.get('email')?.value).subscribe({
        next: () => {
          this.otpSent = true;
          this.loading = false;
          this.toastService.success('OTP sent successfully! Please check your email.');
          this.registerForm.get('otp')?.setValidators([Validators.required, Validators.pattern('^[0-9]{6}$')]);
          this.registerForm.get('otp')?.updateValueAndValidity();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to send OTP';
          this.toastService.error(this.errorMessage);
        }
      });
      return;
    }

    if (!this.otpVerified) {
      this.loading = true;
      this.authService.verifyOtp(this.registerForm.get('email')?.value, this.registerForm.get('otp')?.value).subscribe({
        next: () => {
          this.otpVerified = true;
          this.toastService.success('OTP verified successfully!');
          this.proceedWithRegistration();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Invalid or expired OTP';
          this.toastService.error(this.errorMessage);
        }
      });
      return;
    }

    this.proceedWithRegistration();
  }

  proceedWithRegistration() {
    const { businessName, taxId, businessDescription, otp, ...commonData } = this.registerForm.value;

    if (this.isSeller) {
      const payload = {
        ...commonData,
        businessName,
        taxId,
        businessDescription,
        addresses: []
      };
      this.authService.registerSeller(payload).subscribe({
        next: (res) => {
          this.toastService.success('Seller registration successful! Please login.');
          this.router.navigate(['/login']);
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.error || 'Registration failed';
          this.toastService.error(this.errorMessage);
          this.loading = false;
        }
      });
    } else {
      const payload = {
        ...commonData,
        addresses: []
      };
      this.authService.registerBuyer(payload).subscribe({
        next: (res) => {
          this.toastService.success('Buyer registration successful! Please login.');
          this.router.navigate(['/login']);
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.error || 'Registration failed';
          this.toastService.error(this.errorMessage);
          this.loading = false;
        }
      });
    }
  }

  resendOtp() {
    this.authService.sendOtp(this.registerForm.get('email')?.value).subscribe();
  }

}
