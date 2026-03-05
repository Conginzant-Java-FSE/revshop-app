import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, UserDTO, PasswordUpdateRequest } from './user';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserService]
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get user by id', () => {
        const mockUser: UserDTO = {
            userId: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            age: 25,
            role: 'BUYER'
        };

        service.getUserById(1).subscribe(res => {
            expect(res.data).toEqual(mockUser);
        });

        const req = httpMock.expectOne('/api/users/1');
        expect(req.request.method).toBe('GET');
        req.flush({ data: mockUser });
    });

    it('should update profile', () => {
        const userData: UserDTO = {
            userId: 1,
            name: 'John Updated',
            email: 'john@example.com',
            phone: '1234567890',
            age: 26,
            role: 'BUYER'
        };

        service.updateProfile(1, userData).subscribe(res => {
            expect(res.data.name).toBe('John Updated');
        });

        const req = httpMock.expectOne('/api/users/1/profile');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(userData);
        req.flush({ data: userData });
    });

    it('should update password', () => {
        const request: PasswordUpdateRequest = {
            oldPassword: 'old',
            newPassword: 'new'
        };

        service.updatePassword(1, request).subscribe(res => {
            expect(res.message).toBe('Password updated successfully');
        });

        const req = httpMock.expectOne('/api/users/1/password');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(request);
        req.flush({ message: 'Password updated successfully', data: null });
    });
});
