import { Injectable, signal } from '@angular/core';

export interface Toast {
    message: string;
    type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);

    show(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info'): void {
        const toast: Toast = { message, type };
        this.toasts.update(val => [...val, toast]);
        setTimeout(() => {
            this.toasts.update(val => val.filter(t => t !== toast));
        }, 5000);
    }

    success(message: string): void { this.show(message, 'success'); }
    error(message: string): void { this.show(message, 'danger'); }
}
