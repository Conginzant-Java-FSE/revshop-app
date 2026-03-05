import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShipperService } from '../../services/shipper.service';
import { ApiResponse } from '../../models/api-response.model';


function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    if (password && confirm && password.value !== confirm.value) {
        return { passwordMismatch: true };
    }
    return null;
}

@Component({
    selector: 'app-shipper-register',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink],
    templateUrl: './shipper-register.html',
    styleUrl: './shipper-register.css'
})
export class ShipperRegisterComponent {
    form: FormGroup;
    submitted = false;
    loading = false;
    errorMessage = '';
    successMessage = '';
    showPassword = false;
    showConfirm = false;

    constructor(
        private fb: FormBuilder,
        private shipperService: ShipperService,
        private router: Router
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
            vehicleNumber: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: passwordMatchValidator });
    }

    get f() { return this.form.controls; }

    onSubmit(): void {
        this.submitted = true;
        this.errorMessage = '';
        this.successMessage = '';

        if (this.form.invalid) return;

        this.loading = true;
        const { name, email, phone, vehicleNumber, password } = this.form.value;

        this.shipperService.registerShipper({ name, email, phone, vehicleNumber, password }).subscribe({
            next: (res: ApiResponse<any>) => {
                const data = res.data;
                localStorage.setItem('shipperId', data.shipperId?.toString() || '');
                localStorage.setItem('shipperName', data.name || '');
                localStorage.setItem('shipperEmail', data.email || '');
                localStorage.setItem('shipperVehicle', data.vehicleNumber || '');
                localStorage.setItem('shipperToken', data.token || '');
                localStorage.setItem('role', 'SHIPPER');
                this.loading = false;
                this.router.navigate(['/shipper-dashboard']);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
                this.loading = false;
            }
        });
    }
}
