import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FavoriteService } from './favorite';
import { Favorite } from '../models/favorite.model';
import { ApiResponse } from '../models/api-response.model';

describe('FavoriteService', () => {
    let service: FavoriteService;
    let httpMock: HttpTestingController;

    const mockFavorites: Favorite[] = [
        { productId: 42, productName: 'Laptop' },
        { productId: 55, productName: 'Headphones' }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [FavoriteService]
        });
        service = TestBed.inject(FavoriteService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getFavorites() should fetch user favorite products', () => {
        const response: ApiResponse<Favorite[]> = { message: 'Success', data: mockFavorites };

        service.getFavorites(10).subscribe(res => {
            expect(res.data?.length).toBe(2);
            expect(res.data).toEqual(mockFavorites);
        });

        const req = httpMock.expectOne('/api/favorites/10');
        expect(req.request.method).toBe('GET');
        req.flush(response);
    });

    it('addToFavorite() should send correct productId and userId', () => {
        const response: ApiResponse<void> = { message: 'Added successfully', data: undefined as any };

        service.addToFavorite(10, 99).subscribe(res => {
            expect(res.message).toBe('Added successfully');
        });

        const req = httpMock.expectOne('/api/favorites/10/99');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({});
        req.flush(response);
    });

    it('removeFromFavorite() should call the correct delete API', () => {
        const response: ApiResponse<void> = { message: 'Removed', data: undefined as any };

        service.removeFromFavorite(10, 99).subscribe(res => {
            expect(res.message).toBe('Removed');
        });

        const req = httpMock.expectOne('/api/favorites/10/99');
        expect(req.request.method).toBe('DELETE');
        req.flush(response);
    });
});
