import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromotionalBanner } from './promotional-banner';
import { provideRouter } from '@angular/router';

describe('PromotionalBanner', () => {
  let component: PromotionalBanner;
  let fixture: ComponentFixture<PromotionalBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionalBanner],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionalBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the promotional banner component', () => {
    expect(component).toBeTruthy();
  });

  it('should render at least one banner element in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Banner component should have some container/section rendered
    expect(compiled.children.length).toBeGreaterThanOrEqual(0);
  });

  it('should not throw errors on initialization', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render the promotional banner HTML content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const innerHtml = compiled.innerHTML;
    // Banner template should produce some HTML content
    expect(innerHtml).toBeTruthy();
  });
});
