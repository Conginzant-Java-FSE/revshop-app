import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSeller: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      role: ['BUYER', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', Validators.required],
      businessName: [''],
      taxId: [''],
      businessDescription: ['']
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

    const formData = this.registerForm.value;

    const payload = {
      ...formData,
      addresses: []
    };

    if (this.isSeller) {
      this.authService.registerSeller(payload).subscribe({
        next: (res) => {
          console.log('Seller registration successful', res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Registration failed';
        }
      });
    } else {
      this.authService.registerBuyer(payload).subscribe({
        next: (res) => {
          console.log('Buyer registration successful', res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Registration failed';
        }
      });
    }
  }

}
