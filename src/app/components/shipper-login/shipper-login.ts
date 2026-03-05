import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShipperService } from '../../services/shipper.service';
import { ApiResponse } from '../../models/api-response.model';


@Component({
    selector: 'app-shipper-login',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink],
    templateUrl: './shipper-login.html',
    styleUrl: './shipper-login.css'
})
export class ShipperLoginComponent {
    loginForm: FormGroup;
    submitted = false;
    errorMessage = '';
    loading = false;
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private shipperService: ShipperService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        this.submitted = true;
        this.errorMessage = '';

        if (this.loginForm.invalid) return;

        this.loading = true;
        const { email, password } = this.loginForm.value;

        this.shipperService.loginShipper(email, password).subscribe({
            next: (res: ApiResponse<any>) => {
                const data = res.data;
                localStorage.setItem('shipperToken', data.token || '');
                localStorage.setItem('shipperId', data.shipperId?.toString() || '');
                localStorage.setItem('shipperName', data.name || '');
                localStorage.setItem('shipperEmail', data.email || '');
                localStorage.setItem('shipperVehicle', data.vehicleNumber || '');
                localStorage.setItem('role', 'SHIPPER');
                this.loading = false;
                this.router.navigate(['/shipper-dashboard']);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
                this.loading = false;
            }
        });
    }
}
