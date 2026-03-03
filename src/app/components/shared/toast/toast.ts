import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 2000;">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast show align-items-center text-white border-0 mb-2 shadow-lg" 
           [ngClass]="'bg-' + toast.type" 
           role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body px-3 py-2 fw-bold">
            <i class="fa-solid me-2" [ngClass]="getIcon(toast.type)"></i>
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="remove(toast)"></button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .toast { transition: all 0.3s ease; }
    .toast:hover { transform: scale(1.02); }
  `]
})
export class ToastComponent {
    constructor(public toastService: ToastService) { }

    getIcon(type: string): string {
        switch (type) {
            case 'success': return 'fa-circle-check';
            case 'danger': return 'fa-circle-exclamation';
            case 'warning': return 'fa-triangle-exclamation';
            default: return 'fa-circle-info';
        }
    }

    remove(toast: Toast): void {
        this.toastService.toasts.update(val => val.filter(t => t !== toast));
    }
}
