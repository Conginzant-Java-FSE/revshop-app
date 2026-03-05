import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast';
import { ToastService, Toast } from '../../../services/toast';

describe('ToastComponent', () => {
    let component: ToastComponent;
    let fixture: ComponentFixture<ToastComponent>;
    let toastService: ToastService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToastComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ToastComponent);
        component = fixture.componentInstance;
        toastService = TestBed.inject(ToastService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return correct icon for success', () => {
        expect(component.getIcon('success')).toBe('fa-circle-check');
    });

    it('should return correct icon for danger', () => {
        expect(component.getIcon('danger')).toBe('fa-circle-exclamation');
    });

    it('should return correct icon for warning', () => {
        expect(component.getIcon('warning')).toBe('fa-triangle-exclamation');
    });

    it('should return correct icon for info/default', () => {
        expect(component.getIcon('info')).toBe('fa-circle-info');
        expect(component.getIcon('unknown')).toBe('fa-circle-info');
    });

    it('should remove toast from service', () => {
        const toast: Toast = { message: 'Test', type: 'success' };
        toastService.toasts.set([toast]);

        component.remove(toast);

        expect(toastService.toasts().length).toBe(0);
    });

    it('should have access to toast service', () => {
        expect(component.toastService).toBeTruthy();
    });
});
