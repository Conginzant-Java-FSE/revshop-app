import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService, CategoryDTO } from './category';
import { ApiResponse } from '../models/api-response.model';

describe('CategoryService', () => {
    let service: CategoryService;
    let httpMock: HttpTestingController;

    const mockCategory: CategoryDTO = {
        categoryId: 5,
        name: 'Electronics',
        description: 'Electronic items and gadgets'
    };

    const mockCategoriesRes: ApiResponse<CategoryDTO[]> = {
        message: 'Success',
        data: [mockCategory]
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CategoryService]
        });
        service = TestBed.inject(CategoryService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getAllCategories() should fetch category list from API', () => {
        service.getAllCategories().subscribe(res => {
            expect(res.data?.length).toBe(1);
            expect(res.data).toEqual([mockCategory]);
        });

        const req = httpMock.expectOne('/api/categories');
        expect(req.request.method).toBe('GET');
        req.flush(mockCategoriesRes);
    });

    it('getCategoryById() should handle response correctly', () => {
        const singleRes: ApiResponse<CategoryDTO> = { message: 'Ok', data: mockCategory };

        service.getCategoryById(5).subscribe(res => {
            expect(res.data?.name).toBe('Electronics');
            expect(res.message).toBe('Ok');
        });

        const req = httpMock.expectOne('/api/categories/5');
        expect(req.request.method).toBe('GET');
        req.flush(singleRes);
    });
});
