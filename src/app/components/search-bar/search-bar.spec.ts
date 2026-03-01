import { TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar';
import { provideRouter } from '@angular/router';

describe('SearchBarComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchBarComponent],
            providers: [provideRouter([])],
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(SearchBarComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should have an empty keyword by default', () => {
        const fixture = TestBed.createComponent(SearchBarComponent);
        const component = fixture.componentInstance;
        expect(component.keyword).toBe('');
    });
});
