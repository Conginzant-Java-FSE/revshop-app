import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LocationService, LocationData } from './location.service';

describe('LocationService', () => {
    let service: LocationService;
    let httpMock: HttpTestingController;

    const mockLocation: LocationData = {
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        source: 'manual'
    };

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), LocationService]
        });
        service = TestBed.inject(LocationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with null when no saved location in localStorage', () => {
        expect(service.selectedLocation()).toBeNull();
    });

    it('should restore saved location from localStorage on init', () => {
        localStorage.setItem('deliveryLocation', JSON.stringify(mockLocation));

        // Re-create the service so the constructor reads from localStorage
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), LocationService]
        });
        const freshService = TestBed.inject(LocationService);

        expect(freshService.selectedLocation()).toEqual(mockLocation);
    });

    it('should set location and persist to localStorage', () => {
        service.setLocation(mockLocation);

        expect(service.selectedLocation()).toEqual(mockLocation);
        const stored = JSON.parse(localStorage.getItem('deliveryLocation') || 'null');
        expect(stored).toEqual(mockLocation);
    });

    it('should clear location and remove it from localStorage', () => {
        service.setLocation(mockLocation);
        service.clearLocation();

        expect(service.selectedLocation()).toBeNull();
        expect(localStorage.getItem('deliveryLocation')).toBeNull();
    });

    it('should return null initially when localStorage has invalid JSON', () => {
        localStorage.setItem('deliveryLocation', 'INVALID_JSON');

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), LocationService]
        });
        const freshService = TestBed.inject(LocationService);

        // Should default to null and clean up the bad entry
        expect(freshService.selectedLocation()).toBeNull();
        expect(localStorage.getItem('deliveryLocation')).toBeNull();
    });

    describe('detectGPS()', () => {
        it('should emit LocationData with real city from Nominatim on GPS success', (done) => {
            const mockPosition = {
                coords: { latitude: 17.385, longitude: 78.4867 }
            };
            spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
                (success: PositionCallback) => {
                    success(mockPosition as GeolocationPosition);
                }
            );

            service.detectGPS().subscribe({
                next: (data) => {
                    expect(data.source).toBe('gps');
                    expect(data.city).toBe('Madhapur, Hyderabad - 500081');
                    expect(data.lat).toBe(17.385);
                    expect(data.lng).toBe(78.4867);
                    done();
                },
                error: () => {
                    fail('Expected success but got error');
                    done();
                }
            });

            // Flush the Nominatim reverse-geocode HTTP call
            const req = httpMock.expectOne((r) => r.url.includes('nominatim.openstreetmap.org'));
            req.flush({
                address: {
                    neighbourhood: 'Madhapur',
                    city: 'Hyderabad',
                    state: 'Telangana',
                    country: 'India',
                    postcode: '500081'
                }
            });
        });

        it('should emit error when user denies GPS permission', (done) => {
            const mockError = {
                code: GeolocationPositionError.PERMISSION_DENIED,
                PERMISSION_DENIED: GeolocationPositionError.PERMISSION_DENIED,
                POSITION_UNAVAILABLE: GeolocationPositionError.POSITION_UNAVAILABLE,
                TIMEOUT: GeolocationPositionError.TIMEOUT,
                message: 'User denied'
            } as GeolocationPositionError;

            spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
                (_success: PositionCallback, error: PositionErrorCallback) => {
                    error!(mockError);
                }
            );

            service.detectGPS().subscribe({
                next: () => { fail('Expected error'); done(); },
                error: (err: Error) => {
                    expect(err.message).toBe('Location permission denied.');
                    done();
                }
            });
        });

        it('should emit error when geolocation is unavailable', (done) => {
            const originalGeo = navigator.geolocation;
            // @ts-ignore
            Object.defineProperty(navigator, 'geolocation', { value: null, configurable: true });

            service.detectGPS().subscribe({
                next: () => { fail('Expected error'); done(); },
                error: (err: Error) => {
                    expect(err.message).toContain('not supported');
                    // Restore
                    Object.defineProperty(navigator, 'geolocation', { value: originalGeo, configurable: true });
                    done();
                }
            });
        });
    });
});
