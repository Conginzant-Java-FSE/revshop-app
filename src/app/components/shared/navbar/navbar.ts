import { Component, OnInit, OnDestroy, signal, HostListener, ElementRef, effect, inject, ViewChild } from '@angular/core';
import { RouterLink, Router, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../search-bar/search-bar';
import { NotificationService, NotificationDTO } from '../../../services/notification.service';
import { LocationService } from '../../../services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, SearchBarComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  notifications = signal<NotificationDTO[]>([]);
  unreadCount = signal<number>(0);
  showNotifications = signal<boolean>(false);
  private pollInterval: any;
  private refreshSubscription?: Subscription;
  private routerSubscription?: Subscription;

  // Shipper session (stored separately from buyer/seller auth)
  get isShipper(): boolean {
    return !!localStorage.getItem('shipperId');
  }

  get shipperName(): string {
    return localStorage.getItem('shipperName') || 'Shipper';
  }

  get shipperId(): string {
    return localStorage.getItem('shipperId') || '';
  }

  get isAnyUserLoggedIn(): boolean {
    return !!this.authService.authState().token || this.isShipper;
  }

  get deliveryCity(): string | null {
    return this.locationService.selectedLocation()?.city ?? null;
  }

  openLocationPopup(): void {
    this.locationService.clearLocation();
  }

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    public locationService: LocationService
  ) {
    // Watch authState signal — fires instantly when token changes (login/logout)
    effect(() => {
      const token = this.authService.authState().token;
      if (token) {
        // User just logged in (or page refreshed while logged in) — load immediately
        this.loadNotifications();
        // Start polling if not already running
        if (!this.pollInterval) {
          this.pollInterval = setInterval(() => this.loadNotifications(), 60000);
        }
      } else {
        // User logged out — clear notifications and stop polling
        this.notifications.set([]);
        this.unreadCount.set(0);
        this.showNotifications.set(false);
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to instant refresh events (called after order placement, status changes, etc.)
    this.refreshSubscription = this.notificationService.refresh$.subscribe(() => {
      this.loadNotifications();
    });

    // Close dropdown on route change
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNotifications.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadNotifications(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.notificationService.getNotifications(Number(userId)).subscribe({
      next: (res) => {
        const list = (res.data ?? []).filter(n => n.title && n.message);
        this.notifications.set(list);
        this.unreadCount.set(list.filter(n => !n.isRead).length);
      },
      error: () => { }
    });
  }

  toggleNotifications(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showNotifications.update(v => !v);
  }

  @ViewChild('notificationContainer') notificationContainer!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showNotifications() && this.notificationContainer) {
      const clickedInside = this.notificationContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.showNotifications.set(false);
      }
    }
  }

  markAsRead(notificationId: number, notif?: NotificationDTO): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
        if (notif) {
          this.handleNotificationClick(notif);
        }
      },
      error: () => { }
    });
  }

  handleNotificationClick(notif: NotificationDTO): void {
    if (!notif.type) return;

    switch (notif.type.toUpperCase()) {
      case 'ORDER':
        if (notif.targetId) {
          this.router.navigate(['/orders', notif.targetId]);
        } else {
          this.router.navigate(['/orders']);
        }
        break;
      case 'PRODUCT':
        if (notif.targetId) {
          this.router.navigate(['/product', notif.targetId]);
        } else {
          this.router.navigate(['/products']);
        }
        break;
      case 'PROFILE':
        this.router.navigate(['/profile']);
        break;
      case 'WALLET':
        this.router.navigate(['/wallet']);
        break;
      default:
        // No specific route, stay current
        break;
    }
  }

  markAllRead(): void {
    const unread = this.notifications().filter(n => !n.isRead);
    if (unread.length === 0) return;

    let completed = 0;
    unread.forEach(n => {
      this.notificationService.markAsRead(n.notificationId).subscribe({
        next: () => {
          completed++;
          if (completed === unread.length) {
            this.loadNotifications();
          }
        },
        error: () => {
          completed++;
        }
      });
    });
  }

  onLogout(): void {
    if (this.isShipper) {
      // Clear shipper session
      localStorage.removeItem('shipperId');
      localStorage.removeItem('shipperName');
      localStorage.removeItem('shipperEmail');
      localStorage.removeItem('shipperVehicle');
      localStorage.removeItem('shipperToken');
      localStorage.removeItem('role');
    } else {
      this.authService.logout();
    }
    this.router.navigate(['/']);
  }
}
