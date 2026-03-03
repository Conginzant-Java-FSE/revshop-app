import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
    id: number;
    message: string;
    timestamp: Date;
    read: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private notifications: AppNotification[] = [];
    private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
    private unreadCountSubject = new BehaviorSubject<number>(0);
    private nextId = 1;

    notifications$ = this.notificationsSubject.asObservable();
    unreadCount$ = this.unreadCountSubject.asObservable();

    addNotification(message: string): void {
        const notification: AppNotification = {
            id: this.nextId++,
            message,
            timestamp: new Date(),
            read: false
        };
        this.notifications.unshift(notification);
        this.emitUpdates();
    }

    markAsRead(id: number): void {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.emitUpdates();
        }
    }

    markAllAsRead(): void {
        this.notifications.forEach(n => n.read = true);
        this.emitUpdates();
    }

    getNotifications(): AppNotification[] {
        return this.notifications;
    }

    getUnreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    clearAll(): void {
        this.notifications = [];
        this.emitUpdates();
    }

    private emitUpdates(): void {
        this.notificationsSubject.next([...this.notifications]);
        this.unreadCountSubject.next(this.getUnreadCount());
    }
}
