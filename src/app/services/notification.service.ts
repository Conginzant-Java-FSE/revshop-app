import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface NotificationDTO {
    notificationId: number;
    userId: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = '/api/notifications';

    constructor(private http: HttpClient) { }

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
