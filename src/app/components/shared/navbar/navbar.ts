import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../search-bar/search-bar';
import { NotificationService, NotificationDTO } from '../../../services/notification.service';

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

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    if (this.authService.authState().token) {
      this.loadNotifications();
      this.pollInterval = setInterval(() => this.loadNotifications(), 60000);
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadNotifications(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.notificationService.getNotifications(Number(userId)).subscribe({
      next: (res) => {
        const list = res.data ?? [];
        this.notifications.set(list);
        this.unreadCount.set(list.filter(n => !n.isRead).length);
      },
      error: () => { }
    });
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => this.loadNotifications(),
      error: () => { }
    });
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
