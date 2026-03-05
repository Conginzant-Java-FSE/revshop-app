import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { AuthService } from './services/auth';
import { NotificationService } from './services/notification.service';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    const mockAuthService = {
      authState: () => ({ token: null, role: null, userId: null, name: null }),
      isLoggedIn: () => false,
      userRole: () => null,
      logout: jasmine.createSpy('logout')
    };

    const mockNotificationService = jasmine.createSpyObj('NotificationService', ['getNotifications'], {
      refresh$: of()
    });

    spyOn(localStorage, 'getItem').and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService }
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
});
