import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.html',
    styleUrl: '../login/login.css' // Reuse login styles
})
export class ForgotPasswordComponent {
    emailForm: FormGroup;
    resetForm: FormGroup;

    step = signal<number>(1);
    securityQuestion = signal<string>('');
    loading = signal<boolean>(false);
    submitted = signal<boolean>(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastService: ToastService,
        private router: Router
    ) {
        this.emailForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.resetForm = this.fb.group({
            securityAnswer: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    fetchQuestion() {
        this.submitted.set(true);
        if (this.emailForm.invalid) return;

        this.loading.set(true);
        const email = this.emailForm.get('email')?.value;

        this.authService.getSecurityQuestion(email).subscribe({
            next: (res: any) => {
                this.securityQuestion.set(res.data || res);
                this.step.set(2);
                this.loading.set(false);
                this.submitted.set(false);
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Email not found');
                this.loading.set(false);
            }
        });
    }

    resetPassword() {
        this.submitted.set(true);
        if (this.resetForm.invalid) return;

        this.loading.set(true);
        const payload = {
            email: this.emailForm.get('email')?.value,
            securityAnswer: this.resetForm.get('securityAnswer')?.value,
            newPassword: this.resetForm.get('newPassword')?.value
        };

        this.authService.resetPassword(payload).subscribe({
            next: () => {
                this.toastService.success('Password reset successful! Please login.');
                this.router.navigate(['/login']);
                this.loading.set(false);
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Invalid answer');
                this.loading.set(false);
            }
        });
    }

    sendResetLink() {
        this.submitted.set(true);
        if (this.emailForm.invalid) return;

        this.loading.set(true);
        const email = this.emailForm.get('email')?.value;

        this.authService.sendPasswordResetLink(email).subscribe({
            next: (res: any) => {
                this.toastService.success(res.message || 'Reset link sent to your email.');
                this.step.set(3);
                this.loading.set(false);
                this.submitted.set(false);
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Failed to send reset link.');
                this.loading.set(false);
            }
        });
    }
}
