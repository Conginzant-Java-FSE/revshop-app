import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar';
import { provideRouter, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('SearchBarComponent', () => {
    let component: SearchBarComponent;
    let fixture: ComponentFixture<SearchBarComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchBarComponent, CommonModule, FormsModule],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchBarComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create the search bar component', () => {
        expect(component).toBeTruthy();
    });

    it('should have keyword initialized as empty string', () => {
        expect(component.keyword).toBe('');
    });

    it('should have isReadonly initialized as true', () => {
        expect(component.isReadonly).toBeTrue();
    });

    it('should set isReadonly to false after 300ms', fakeAsync(() => {
        component.ngOnInit();
        tick(300);
        expect(component.isReadonly).toBeFalse();
    }));

    it('should render the search input field', () => {
        fixture.detectChanges();
        const input = fixture.debugElement.query(By.css('input'));
        expect(input).toBeTruthy();
    });

    it('should update keyword on user input', fakeAsync(() => {
        // We do not need to tick(300) here, we can just update the keyword directly
        // and assert that the component property updated.
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

        // Simulate user typing
        inputElement.value = 'laptop';
        inputElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        tick(); // wait for ngModel to update

        expect(component.keyword).toBe('laptop');
    }));

    it('should navigate to /products with query param when onSearch is called with non-empty keyword', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.keyword = 'headphones';
        component.onSearch();
        expect(navigateSpy).toHaveBeenCalledWith(['/products'], { queryParams: { search: 'headphones' } });
    });

    it('should NOT navigate when onSearch is called with empty keyword', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.keyword = '   ';
        component.onSearch();
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should trim whitespace from keyword before navigating', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.keyword = '  shoes  ';
        component.onSearch();
        expect(navigateSpy).toHaveBeenCalledWith(['/products'], { queryParams: { search: 'shoes' } });
    });

    it('should clear keyword when navigating away from /products page', fakeAsync(() => {
        component.keyword = 'watches';
        // Navigate to a non-products route to trigger the subscription
        router.navigate(['/']);
        tick();
        fixture.detectChanges();
        expect(component.keyword).toBe('');
    }));
});
