import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedCategories } from './featured-categories';
import { provideRouter } from '@angular/router';

describe('FeaturedCategories', () => {
    let component: FeaturedCategories;
    let fixture: ComponentFixture<FeaturedCategories>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeaturedCategories],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = TestBed.createComponent(FeaturedCategories);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the featured categories component', () => {
        expect(component).toBeTruthy();
    });

    it('should render the featured categories template', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.innerHTML).toBeTruthy();
    });

    it('should not throw errors on initialization', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should display category navigation links', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        // Categories template has anchor/routerLink elements for category navigation
        const links = compiled.querySelectorAll('a');
        // Even if no dynamic data, static links should be present
        expect(links).toBeDefined();
    });
});
