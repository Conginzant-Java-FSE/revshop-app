import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserDTO, PasswordUpdateRequest } from '../../services/user';
import { AddressService, AddressDTO } from '../../services/address';
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
      <div class="row g-4">
        <!-- Profile Card -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div class="card-header bg-primary text-white py-4">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                  <div class="profile-avatar bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 80px; height: 80px;">
                    <i class="fa-solid fa-user fs-2"></i>
                  </div>
                  <div>
                    <h2 class="mb-1 fw-bold">{{ user()?.name }}</h2>
                    <span class="badge bg-white bg-opacity-25 text-white rounded-pill px-3">{{ user()?.role }}</span>
                  </div>
                </div>
                <button *ngIf="!isEditMode()" class="btn btn-light rounded-pill px-4" (click)="toggleEditMode()">
                  <i class="fa-solid fa-pen-to-square me-2"></i>Edit Profile
                </button>
              </div>
            </div>
            
            <div class="card-body p-4">
              <div *ngIf="loading()" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Loading profile...</p>
              </div>
              
              <div *ngIf="!loading() && user()" class="profile-details">
                <div class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Full Name</label>
                    <div *ngIf="!isEditMode()" class="detail-value fs-5 fw-semibold border-bottom pb-2">{{ user()?.name }}</div>
                    <input *ngIf="isEditMode()" type="text" class="form-control rounded-pill" [(ngModel)]="editForm().name">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Email Address</label>
                    <div class="detail-value fs-5 fw-semibold border-bottom pb-2 text-muted">{{ user()?.email }}</div>
                    <small *ngIf="isEditMode()" class="text-muted">Email cannot be changed</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Phone Number</label>
                    <div *ngIf="!isEditMode()" class="detail-value fs-5 fw-semibold border-bottom pb-2">{{ user()?.phone || 'Not provided' }}</div>
                    <input *ngIf="isEditMode()" type="text" class="form-control rounded-pill" [(ngModel)]="editForm().phone">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted small text-uppercase fw-bold">Age</label>
                    <div *ngIf="!isEditMode()" class="detail-value fs-5 fw-semibold border-bottom pb-2">{{ user()?.age }} years</div>
                    <input *ngIf="isEditMode()" type="number" class="form-control rounded-pill" [(ngModel)]="editForm().age">
                  </div>
                </div>

                <div *ngIf="isEditMode()" class="d-flex gap-2 mt-4">
                  <button class="btn btn-primary rounded-pill px-4" [disabled]="submittingEdit()" (click)="saveProfile()">
                    <span *ngIf="submittingEdit()" class="spinner-border spinner-border-sm me-2"></span>Save Changes
                  </button>
                  <button class="btn btn-light rounded-pill px-4" (click)="cancelEdit()">Cancel</button>
                </div>
                
                <div class="mt-5 pt-4 border-top">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 class="fw-bold mb-1 text-dark">Account Security</h5>
                      <p class="text-muted small mb-0">Update your password to keep your account safe</p>
                    </div>
                    <button class="btn btn-outline-primary rounded-pill px-4" (click)="openPasswordModal()">Change Password</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Addresses Section -->
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0 text-dark">My Addresses</h5>
                <button class="btn btn-primary btn-sm rounded-pill px-3" (click)="openAddressModal()">
                  <i class="fa-solid fa-plus me-2"></i>Add Address
                </button>
              </div>

              <div *ngIf="loadingAddresses()" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>

              <div *ngIf="!loadingAddresses() && addresses().length === 0" class="text-center py-4 bg-light rounded-3">
                <i class="fa-solid fa-map-location-dot fs-2 text-muted mb-2"></i>
                <p class="text-muted mb-0">No addresses saved yet.</p>
              </div>

              <div class="row g-3">
                <div class="col-md-6" *ngFor="let addr of addresses()">
                  <div class="address-card p-3 border rounded-3 position-relative transition-all h-100">
                    <div class="d-flex justify-content-between mb-2">
                      <span *ngIf="addr.isDefault" class="badge bg-success-subtle text-success rounded-pill x-small">Default</span>
                      <div class="d-flex gap-2 ms-auto">
                        <button class="btn btn-link text-primary p-0" (click)="editAddress(addr)" title="Edit">
                          <i class="fa-solid fa-pen-to-square small"></i>
                        </button>
                        <button class="btn btn-link text-muted p-0" (click)="deleteAddress(addr.addressId!)" title="Delete">
                          <i class="fa-solid fa-trash-can small"></i>
                        </button>
                      </div>
                    </div>
                    <p class="mb-1 fw-medium text-dark">{{ addr.addressLine }}</p>
                    <p class="mb-0 text-muted small">{{ addr.city }}, {{ addr.state }} {{ addr.zipCode }}</p>
                    <p class="mb-0 text-muted small">{{ addr.country }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Role Info/Side Card -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 bg-light">
            <div class="card-body p-4 text-center">
              <div class="mb-3">
                <div class="bg-white p-3 rounded-circle d-inline-block shadow-sm">
                  <i class="fa-solid fa-shield-halved text-primary fs-3"></i>
                </div>
              </div>
              <h6 class="fw-bold mb-2">Account Type: {{ user()?.role }}</h6>
              <p class="text-muted small mb-0">Your account is active and verified. You can manage your orders and profile details from here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal fade" [class.show]="showPasswordModal()" [style.display]="showPasswordModal() ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Change Password</h5>
            <button type="button" class="btn-close" (click)="closePasswordModal()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">CURRENT PASSWORD</label>
              <input type="password" class="form-control rounded-pill px-3" [(ngModel)]="passwordForm.oldPassword" placeholder="Current password">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">NEW PASSWORD</label>
              <input type="password" class="form-control rounded-pill px-3" [(ngModel)]="passwordForm.newPassword" placeholder="New password">
            </div>
          </div>
          <div class="modal-footer border-0 p-4 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" (click)="closePasswordModal()">Cancel</button>
            <button type="button" class="btn btn-primary rounded-pill px-4" [disabled]="submitting()" (click)="onPasswordSubmit()">
              <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-2"></span>Update Password
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Address Modal -->
    <div class="modal fade" [class.show]="showAddressModal()" [style.display]="showAddressModal() ? 'block' : 'none'" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ editingAddressId() ? 'Edit Address' : 'Add New Address' }}</h5>
            <button type="button" class="btn-close" (click)="closeAddressModal()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">ADDRESS LINE</label>
              <input type="text" class="form-control rounded-pill" [(ngModel)]="addressForm().addressLine" placeholder="e.g. 123 Main St">
            </div>
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">CITY</label>
                <input type="text" class="form-control rounded-pill" [(ngModel)]="addressForm().city" placeholder="City">
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">STATE</label>
                <input type="text" class="form-control rounded-pill" [(ngModel)]="addressForm().state" placeholder="State">
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">ZIP CODE</label>
                <input type="text" class="form-control rounded-pill" [(ngModel)]="addressForm().zipCode" placeholder="Zip Code">
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">COUNTRY</label>
                <input type="text" class="form-control rounded-pill" [(ngModel)]="addressForm().country" placeholder="Country">
              </div>
            </div>
            <div class="form-check form-switch mt-3">
              <input class="form-check-input" type="checkbox" id="isDefault" [(ngModel)]="addressForm().isDefault">
              <label class="form-check-label small" for="isDefault">Set as default address</label>
            </div>
          </div>
          <div class="modal-footer border-0 p-4 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" (click)="closeAddressModal()">Cancel</button>
            <button type="button" class="btn btn-primary rounded-pill px-4" [disabled]="addressSubmitting()" (click)="saveAddress()">
              <span *ngIf="addressSubmitting()" class="spinner-border spinner-border-sm me-2"></span>Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="showPasswordModal() || showAddressModal()" class="modal-backdrop fade show"></div>
  `,
  styles: [`
    .container { max-width: 1000px; }
    .profile-avatar { border: 4px solid rgba(255,255,255,0.2); }
    .address-card:hover { border-color: var(--bs-primary) !important; background: var(--bs-light); }
    .x-small { font-size: 0.65rem; }
    .transition-all { transition: all 0.2s ease; }
    .modal { background: rgba(0,0,0,0.5); }
    input.form-control:focus { box-shadow: none; border-color: var(--bs-primary); }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<UserDTO | null>(null);
  loading = signal<boolean>(true);

  // Profile Edit
  isEditMode = signal<boolean>(false);
  submittingEdit = signal<boolean>(false);
  editForm = signal<any>({ name: '', phone: '', age: 0 });

  // Password Update
  showPasswordModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  passwordForm: PasswordUpdateRequest = { oldPassword: '', newPassword: '' };

  // Address Management
  addresses = signal<AddressDTO[]>([]);
  loadingAddresses = signal<boolean>(true);
  showAddressModal = signal<boolean>(false);
  addressSubmitting = signal<boolean>(false);
  editingAddressId = signal<number | null>(null);
  addressForm = signal<AddressDTO>({
    addressLine: '', city: '', state: '', zipCode: '', country: '', isDefault: false
  });

  constructor(
    private userService: UserService,
    private addressService: AddressService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.loadProfile(Number(userId));
      this.loadAddresses(Number(userId));
    } else {
      this.loading.set(false);
      this.loadingAddresses.set(false);
    }
  }

  loadProfile(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.success('Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  loadAddresses(userId: number): void {
    this.loadingAddresses.set(true);
    this.addressService.getAddressesByUserId(userId).subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        this.loadingAddresses.set(false);
      },
      error: () => this.loadingAddresses.set(false)
    });
  }

  // Edit Profile Methods
  toggleEditMode(): void {
    if (this.user()) {
      this.editForm.set({
        name: this.user()?.name,
        phone: this.user()?.phone,
        age: this.user()?.age
      });
      this.isEditMode.set(true);
    }
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
  }

  saveProfile(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.submittingEdit.set(true);
    const updatedData = { ...this.user()!, ...this.editForm() };

    this.userService.updateProfile(Number(userId), updatedData).subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.toastService.success('Profile updated successfully');
        this.submittingEdit.set(false);
        this.isEditMode.set(false);
      },
      error: (err) => {
        this.toastService.success(err.error?.message || 'Failed to update profile');
        this.submittingEdit.set(false);
      }
    });
  }

  // Password Modal Methods
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

    this.submitting.set(true);
    this.userService.updatePassword(Number(userId), this.passwordForm).subscribe({
      next: () => {
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

  // Address Modal Methods
  openAddressModal(): void {
    this.editingAddressId.set(null);
    this.addressForm.set({
      addressLine: '', city: '', state: '', zipCode: '', country: '', isDefault: false
    });
    this.showAddressModal.set(true);
  }

  editAddress(addr: AddressDTO): void {
    this.editingAddressId.set(addr.addressId ?? null);
    this.addressForm.set({ ...addr });
    this.showAddressModal.set(true);
  }

  closeAddressModal(): void {
    this.showAddressModal.set(false);
    this.editingAddressId.set(null);
  }

  saveAddress(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const data = this.addressForm();
    if (!data.addressLine || !data.city || !data.state || !data.zipCode || !data.country) {
      this.toastService.success('Please fill all required fields');
      return;
    }

    this.addressSubmitting.set(true);
    const editId = this.editingAddressId();

    if (editId) {
      this.addressService.updateAddress(editId, data).subscribe({
        next: () => {
          this.toastService.success('Address updated successfully');
          this.addressSubmitting.set(false);
          this.closeAddressModal();
          this.loadAddresses(Number(userId));
        },
        error: () => {
          this.toastService.success('Failed to update address');
          this.addressSubmitting.set(false);
        }
      });
    } else {
      this.addressService.addAddress(data, Number(userId)).subscribe({
        next: () => {
          this.toastService.success('Address added successfully');
          this.addressSubmitting.set(false);
          this.closeAddressModal();
          this.loadAddresses(Number(userId));
        },
        error: () => {
          this.toastService.success('Failed to add address');
          this.addressSubmitting.set(false);
        }
      });
    }
  }

  deleteAddress(id: number): void {
    if (!confirm('Are you sure you want to delete this address?')) return;

    this.addressService.deleteAddress(id).subscribe({
      next: () => {
        this.toastService.success('Address deleted successfully');
        const userId = localStorage.getItem('userId');
        if (userId) this.loadAddresses(Number(userId));
      },
      error: () => this.toastService.success('Failed to delete address')
    });
  }
}
