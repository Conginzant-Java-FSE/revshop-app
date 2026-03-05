import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null auth state if localStorage is empty', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.userRole()).toBeNull();
  });

  it('should register buyer', () => {
    const mockData = { name: 'John', email: 'john@test.com' };
    service.registerBuyer(mockData).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne('/api/auth/register/buyer');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush({ success: true });
  });

  it('should register seller', () => {
    const mockData = { businessName: 'Store' };
    service.registerSeller(mockData).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne('/api/auth/register/seller');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should login buyer', () => {
    const credentials = { email: 'test@test.com', password: '123' };
    service.loginBuyer(credentials).subscribe();

    const req = httpMock.expectOne('/api/auth/login/buyer');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc' });
  });

  it('should login seller', () => {
    const credentials = { email: 'test@test.com', password: '123' };
    service.loginSeller(credentials).subscribe();

    const req = httpMock.expectOne('/api/auth/login/seller');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc' });
  });

  it('should save auth data and update state', () => {
    service.saveAuthData('token123', 'BUYER', '1', 'John');

    expect(localStorage.getItem('token')).toBe('token123');
    expect(localStorage.getItem('role')).toBe('BUYER');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.userRole()).toBe('BUYER');
    expect(service.authState().name).toBe('John');
  });

  it('should clear data on logout', () => {
    service.saveAuthData('token123', 'BUYER', '1', 'John');
    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.authState().token).toBeNull();
  });

  it('should get security question', () => {
    const email = 'test@test.com';
    service.getSecurityQuestion(email).subscribe(res => {
      expect(res.data).toBe('What is your pet name?');
    });

    const req = httpMock.expectOne(request =>
      request.url === '/api/auth/security-question' && request.params.get('email') === email
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: 'What is your pet name?' });
  });

  it('should reset password', () => {
    const resetData = { email: 'test@test.com', securityAnswer: 'Fluffy', newPassword: 'new' };
    service.resetPassword(resetData).subscribe();

    const req = httpMock.expectOne('/api/auth/reset-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(resetData);
    req.flush({ message: 'Success' });
  });
});
