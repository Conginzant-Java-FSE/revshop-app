import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { AuthService } from './services/auth';
import { NotificationService } from './services/notification.service';
import { LocationService } from './services/location.service';
import { of } from 'rxjs';

import { signal } from '@angular/core';

describe('App', () => {
  let mockAuthService: any;
  let mockLocationService: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockAuthService = {
      authState: signal({ token: null, role: null, userId: null, name: null }),
      isLoggedIn: () => false,
      userRole: () => null,
      logout: jasmine.createSpy('logout')
    };

    const mockNotificationService = jasmine.createSpyObj('NotificationService', ['getNotifications'], {
      refresh$: of()
    });

    mockLocationService = {
      selectedLocation: signal(null),
      isPopupDismissed: signal(false)
    };

    spyOn(localStorage, 'getItem').and.callFake((key: string) => null);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: LocationService, useValue: mockLocationService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have title signal with value revshop-app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect((app as any).title()).toBe('revshop-app');
  });

  it('should not show location popup when logged out', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showLocationPopup()).toBeFalse();
  });

  it('should show location popup when buyer/seller is logged in and no location is set', () => {
    mockAuthService.authState.set({ token: 'abc', role: 'BUYER', userId: 1, name: 'Test' });
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showLocationPopup()).toBeTrue();
  });

  it('should show location popup when shipper is logged in and no location is set', () => {
    (localStorage.getItem as jasmine.Spy).and.callFake((key: string) => key === 'shipperId' ? '1' : null);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showLocationPopup()).toBeTrue();
  });

  it('should hide location popup when location is already set, even if logged in', () => {
    mockAuthService.authState.set({ token: 'abc', role: 'BUYER', userId: 1, name: 'Test' });
    mockLocationService.selectedLocation.set({ city: 'Test City', source: 'gps', lat: 0, lng: 0 });
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showLocationPopup()).toBeFalse();
  });
});
