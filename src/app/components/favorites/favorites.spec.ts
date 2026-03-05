import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FavoritesComponent } from './favorites';
import { provideRouter } from '@angular/router';
import { FavoriteService } from '../../services/favorite';
import { ToastService } from '../../services/toast';
import { of } from 'rxjs';
import { Favorite } from '../../models/favorite.model';

// ─── Test data ───────────────────────────────────────────────────────────────

const MOCK_FAVORITES: Favorite[] = [
    { productId: 1, productName: 'Wireless Headphones' },
    { productId: 2, productName: 'Smart Watch' }
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FavoritesComponent', () => {
    let component: FavoritesComponent;
    let fixture: ComponentFixture<FavoritesComponent>;
    let favoriteService: jasmine.SpyObj<FavoriteService>;
    let toastService: jasmine.SpyObj<ToastService>;

    beforeEach(async () => {
        favoriteService = jasmine.createSpyObj('FavoriteService', ['getFavorites', 'removeFromFavorite']);
        favoriteService.getFavorites.and.returnValue(of({ message: 'ok', data: MOCK_FAVORITES }));
        favoriteService.removeFromFavorite.and.returnValue(of({ message: 'ok', data: undefined }));

        toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [FavoritesComponent],
            providers: [
                provideRouter([]),
                { provide: FavoriteService, useValue: favoriteService },
                { provide: ToastService, useValue: toastService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FavoritesComponent);
        component = fixture.componentInstance;
    });

    // ── Creation ──────────────────────────────────────────────────────────────

    it('should create the favorites component', () => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    // ── Loading with userId ───────────────────────────────────────────────────

    it('should call getFavorites with userId on init when user is logged in', () => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();
        expect(favoriteService.getFavorites).toHaveBeenCalledWith(42);
    });

    it('should populate favorites signal after successful load', () => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();
        expect(component.favorites()).toEqual(MOCK_FAVORITES);
    });

    it('should set loading to false after favorites are loaded', () => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();
        expect(component.loading()).toBeFalse();
    });

    it('should display the correct number of favorite products', () => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();
        expect(component.favorites().length).toBe(2);
    });

    // ── Loading without userId ────────────────────────────────────────────────

    it('should NOT call getFavorites when no userId in localStorage', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        fixture.detectChanges();
        expect(favoriteService.getFavorites).not.toHaveBeenCalled();
    });

    it('should set loading to false even when no userId', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        fixture.detectChanges();
        expect(component.loading()).toBeFalse();
    });

    it('should leave favorites list empty when no userId', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        fixture.detectChanges();
        expect(component.favorites()).toEqual([]);
    });

    // ── Remove favorite ───────────────────────────────────────────────────────

    it('should call removeFromFavorite with correct userId and productId', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();

        component.removeFavorite(1);
        tick();
        expect(favoriteService.removeFromFavorite).toHaveBeenCalledWith(42, 1);
    }));

    it('should show success toast after removing a favorite', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();

        component.removeFavorite(1);
        tick();
        expect(toastService.success).toHaveBeenCalledWith('Removed from favorites');
    }));

    it('should reload favorites after successful removal', fakeAsync(() => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();
        favoriteService.getFavorites.calls.reset();

        component.removeFavorite(2);
        tick();
        // loadFavorites should be called again after removal
        expect(favoriteService.getFavorites).toHaveBeenCalledWith(42);
    }));

    it('should NOT call removeFromFavorite when no userId', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        fixture.detectChanges();
        component.removeFavorite(1);
        expect(favoriteService.removeFromFavorite).not.toHaveBeenCalled();
    });

    // ── Template rendering ────────────────────────────────────────────────────

    it('should render the favorites template without errors', () => {
        spyOn(localStorage, 'getItem').and.returnValue('42');
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.innerHTML).toBeTruthy();
    });
});
