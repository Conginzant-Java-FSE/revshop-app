import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddressService, AddressDTO } from './address';

describe('AddressService', () => {
    let service: AddressService;
    let httpMock: HttpTestingController;

    const mockAddress: AddressDTO = {
        addressId: 1,
        addressLine: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        isDefault: true
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AddressService]
        });
        service = TestBed.inject(AddressService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch addresses by user ID', () => {
        service.getAddressesByUser(1).subscribe(res => {
            expect(res).toEqual([mockAddress]);
        });

        const req = httpMock.expectOne('/api/addresses/user/1');
        expect(req.request.method).toBe('GET');
        req.flush([mockAddress]);
    });

    it('should add a new address', () => {
        service.addAddress(mockAddress).subscribe(res => {
            expect(res).toEqual(mockAddress);
        });

        const req = httpMock.expectOne('/api/addresses');
        expect(req.request.method).toBe('POST');
        req.flush(mockAddress);
    });
});
