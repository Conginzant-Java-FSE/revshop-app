import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile';
import { UserService } from '../../services/user';
import { AddressService } from '../../services/address';
import { ToastService } from '../../services/toast';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let userServiceSpy: any;
    let addressServiceSpy: any;
    let toastServiceSpy: any;
    let router: Router;

    beforeEach(async () => {
        userServiceSpy = {
            getUserById: vi.fn(),
            updateProfile: vi.fn(),
            updatePassword: vi.fn()
        };
        addressServiceSpy = {
            getAddressesByUserId: vi.fn(),
            addAddress: vi.fn(),
            updateAddress: vi.fn(),
            deleteAddress: vi.fn()
        };
        toastServiceSpy = {
            success: vi.fn(),
            error: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ProfileComponent, FormsModule, CommonModule],
            providers: [
                provideRouter([]),
                { provide: UserService, useValue: userServiceSpy },
                { provide: AddressService, useValue: addressServiceSpy },
                { provide: ToastService, useValue: toastServiceSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate');
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load profile and addresses on init if userId exists in localStorage', async () => {
        localStorage.setItem('userId', '1');
        const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'BUYER' };
        const mockAddresses = [{ addressId: 10, addressLine: '123 St' }];

        userServiceSpy.getUserById.mockReturnValue(of({ data: mockUser as any }));
        addressServiceSpy.getAddressesByUserId.mockReturnValue(of({ data: mockAddresses as any }));

        fixture.detectChanges();
        await fixture.whenStable();

        expect(userServiceSpy.getUserById).toHaveBeenCalledWith(1);
        expect(addressServiceSpy.getAddressesByUserId).toHaveBeenCalledWith(1);
        expect(component.user()).toEqual(mockUser as any);
        expect(component.addresses()).toEqual(mockAddresses as any);
        expect(component.loading()).toBe(false);
    });

    it('should toggle edit mode correctly', (() => {
        component.user.set({ name: 'John', phone: '123', age: 25 } as any);
        component.toggleEditMode();

        expect(component.isEditMode()).toBe(true);
        expect(component.editForm.name).toBe('John');
        expect(component.editForm.phone).toBe('123');
        expect(component.editForm.age).toBe(25);
    }));

    it('should update profile successfully', async () => {
        localStorage.setItem('userId', '1');
        component.user.set({ id: 1, name: 'Old Name' } as any);
        component.editForm = { name: 'New Name' };

        userServiceSpy.updateProfile.mockReturnValue(of({ data: { id: 1, name: 'New Name' } as any }));

        component.saveProfile();
        await fixture.whenStable();

        expect(userServiceSpy.updateProfile).toHaveBeenCalled();
        expect(component.user()?.name).toBe('New Name');
        expect(toastServiceSpy.success).toHaveBeenCalledWith('Profile updated successfully');
        expect(component.isEditMode()).toBe(false);
    });

    it('should show error when profile update fails', async () => {
        localStorage.setItem('userId', '1');
        component.user.set({ id: 1, name: 'Name' } as any);
        userServiceSpy.updateProfile.mockReturnValue(throwError(() => ({ error: { message: 'Update failed' } })));

        component.saveProfile();
        await fixture.whenStable();

        expect(toastServiceSpy.error).toHaveBeenCalledWith('Update failed');
        expect(component.submittingEdit()).toBe(false);
    });

    it('should open and close password modal', () => {
        component.openPasswordModal();
        expect(component.showPasswordModal()).toBe(true);
        expect(component.passwordForm.oldPassword).toBe('');

        component.closePasswordModal();
        expect(component.showPasswordModal()).toBe(false);
    });

    it('should show error toast if password fields are missing on submit', () => {
        localStorage.setItem('userId', '1');
        component.passwordForm = { oldPassword: '', newPassword: '' };
        component.onPasswordSubmit();

        expect(toastServiceSpy.success).toHaveBeenCalledWith('Please fill all fields');
        expect(userServiceSpy.updatePassword).not.toHaveBeenCalled();
    });

    it('should update password successfully', async () => {
        localStorage.setItem('userId', '1');
        component.passwordForm = { oldPassword: 'old', newPassword: 'new' };
        userServiceSpy.updatePassword.mockReturnValue(of({}));

        component.onPasswordSubmit();
        await fixture.whenStable();

        expect(userServiceSpy.updatePassword).toHaveBeenCalled();
        expect(toastServiceSpy.success).toHaveBeenCalledWith('Password updated successfully');
        expect(component.showPasswordModal()).toBe(false);
    });

    it('should manage addresses correctly (open modal, edit)', () => {
        const mockAddr = { addressId: 5, addressLine: 'Test Line' } as any;

        component.editAddress(mockAddr);
        expect(component.editingAddressId()).toBe(5);
        expect(component.addressForm().addressLine).toBe('Test Line');
        expect(component.showAddressModal()).toBe(true);
    });

    it('should save new address successfully', async () => {
        localStorage.setItem('userId', '1');
        component.editingAddressId.set(null);
        component.addressForm.set({
            addressLine: '123 St', city: 'City', state: 'State', zipCode: '12345', country: 'US', isDefault: true
        });

        addressServiceSpy.addAddress.mockReturnValue(of({}));

        // Mock reload
        addressServiceSpy.getAddressesByUserId.mockReturnValue(of([]));

        component.saveAddress();
        await fixture.whenStable();

        expect(addressServiceSpy.addAddress).toHaveBeenCalled();
        expect(toastServiceSpy.success).toHaveBeenCalledWith('Address added successfully');
        expect(component.showAddressModal()).toBe(false);
    });

    it('should delete address on confirmation', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        addressServiceSpy.deleteAddress.mockReturnValue(of({}));

        component.deleteAddress(1);
        await fixture.whenStable();

        expect(addressServiceSpy.deleteAddress).toHaveBeenCalledWith(1);
        expect(toastServiceSpy.success).toHaveBeenCalledWith('Address deleted successfully');
    });
});
