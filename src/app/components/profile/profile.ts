import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserDTO, PasswordUpdateRequest } from '../../services/user';
import { AuthService } from '../../services/auth';
import { Navbar } from '../shared/navbar/navbar';
import { Header } from '../shared/header/header';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Navbar, Header, FormsModule],
  template: `
    <app-navbar></app-navbar>
    <app-header></app-header>
    
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="card-header bg-primary text-white py-4 position-relative">
              <div class="d-flex align-items-center gap-4">
                <div class="profile-avatar bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow" style="width: 100px; height: 100px;">
                  <i class="fa-solid fa-user fs-1"></i>
                </div>
                <div>
                  <h2 class="mb-1 fw-bold">{{ user()?.name }}</h2>
                  <span class="badge bg-light text-primary rounded-pill px-3">{{ user()?.role }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-body p-5">
              <div *ngIf="loading()" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Loading profile...</p>
              </div>
              
              <div *ngIf="!loading() && user()" class="profile-details">
                <div class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Full Name</label>
                    <div class="detail-value fs-5 fw-semibold border-bottom pb-2">{{ user()?.name }}</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Email Address</label>
                    <div class="detail-value fs-5 fw-semibold border-bottom pb-2">{{ user()?.email }}</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Phone Number</label>
                    <div class="detail-value fs-5 fw-semibold border-bottom pb-2">{{ user()?.phone }}</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Age</label>
                    <div class="detail-value fs-5 fw-semibold border-bottom pb-2">{{ user()?.age }} years</div>
                  </div>
                </div>
                
                <div class="mt-5 pt-4 border-top">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 class="fw-bold mb-1">Account Security</h5>
                      <p class="text-muted small mb-0">Update your password or account settings</p>
                    </div>
                    <button class="btn btn-outline-primary rounded-pill px-4" (click)="openPasswordModal()">Change Password</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal fade" [class.show]="showPasswordModal()" [style.display]="showPasswordModal() ? 'block' : 'none'" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-light border-0 py-3">
            <h5 class="modal-title fw-bold">Change Password</h5>
            <button type="button" class="btn-close" (click)="closePasswordModal()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Current Password</label>
              <input type="password" class="form-control rounded-pill px-3" [(ngModel)]="passwordForm.oldPassword" placeholder="Enter current password">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">New Password</label>
              <input type="password" class="form-control rounded-pill px-3" [(ngModel)]="passwordForm.newPassword" placeholder="Enter new password">
            </div>
          </div>
          <div class="modal-footer border-0 p-4 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" (click)="closePasswordModal()">Cancel</button>
            <button type="button" class="btn btn-primary rounded-pill px-4" [disabled]="submitting()" (click)="onPasswordSubmit()">
              <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-2"></span>
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="showPasswordModal()" class="modal-backdrop fade show"></div>
  `,
  styles: [`
    .card {
      transition: transform 0.3s ease;
    }
    .profile-avatar {
      border: 4px solid rgba(255,255,255,0.3);
    }
    .detail-value {
      color: #2d3436;
    }
    .modal.show {
      background: rgba(0,0,0,0.5);
    }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<UserDTO | null>(null);
  loading = signal<boolean>(true);
  showPasswordModal = signal<boolean>(false);
  submitting = signal<boolean>(false);

  passwordForm: PasswordUpdateRequest = {
    oldPassword: '',
    newPassword: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.userService.getUserById(Number(userId)).subscribe({
        next: (res) => {
          this.user.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.toastService.success('Failed to load profile');
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  openPasswordModal(): void {
    this.passwordForm = { oldPassword: '', newPassword: '' };
    this.showPasswordModal.set(true);
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
  }

  onPasswordSubmit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId || !this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
      this.toastService.success('Please fill all fields');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.toastService.success('New password must be at least 8 characters');
      return;
    }

    this.submitting.set(true);
    this.userService.updatePassword(Number(userId), this.passwordForm).subscribe({
      next: (res) => {
        this.toastService.success('Password updated successfully');
        this.submitting.set(false);
        this.closePasswordModal();
      },
      error: (err) => {
        this.toastService.success(err.error?.message || 'Failed to update password');
        this.submitting.set(false);
      }
    });
  }
}
