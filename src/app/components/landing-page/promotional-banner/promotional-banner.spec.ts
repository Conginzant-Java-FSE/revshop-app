import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionalBanner } from './promotional-banner';

describe('PromotionalBanner', () => {
    let component: PromotionalBanner;
    let fixture: ComponentFixture<PromotionalBanner>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PromotionalBanner]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PromotionalBanner);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
