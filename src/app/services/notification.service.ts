import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface NotificationDTO {
    notificationId: number;
    userId: number;
    title: string;
    message: string;
    isRead: boolean;
    type?: string;
    targetId?: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = '/api/notifications';

    /** Emit on this subject to trigger an immediate notification reload in the Navbar */
    private refreshSubject = new Subject<void>();
    readonly refresh$ = this.refreshSubject.asObservable();

    constructor(private http: HttpClient) { }

    /** Call this after any order action (cancel, return, etc.) to refresh the bell instantly */
    triggerRefresh(): void {
        this.refreshSubject.next();
    }

    getNotifications(userId: number): Observable<ApiResponse<NotificationDTO[]>> {
        return this.http.get<ApiResponse<NotificationDTO[]>>(`${this.apiUrl}/user/${userId}`);
    }

    markAsRead(notificationId: number): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${notificationId}/read`, {});
    }

    deleteNotification(notificationId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${notificationId}`);
    }
}
