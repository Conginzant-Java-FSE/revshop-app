import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: '../login/login.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token.set(params['token']);
      if (!this.token()) {
        this.toastService.error('Invalid or missing reset token.');
        this.router.navigate(['/login']);
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.resetForm.invalid || !this.token()) return;

    this.loading.set(true);
    const payload = {
      token: this.token(),
      newPassword: this.resetForm.get('newPassword')?.value
    };

    this.authService.resetPasswordViaLink(payload).subscribe({
      next: () => {
        this.toastService.success('Password reset successfully! Please log in.');
        this.router.navigate(['/login']);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to reset password. The link may have expired.');
        this.loading.set(false);
      }
    });
  }
}
