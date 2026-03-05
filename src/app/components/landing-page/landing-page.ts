import { Component } from '@angular/core';
import { PromotionalBanner } from './promotional-banner/promotional-banner';
import { FeaturedCategories } from './featured-categories/featured-categories';
import { FeaturedProducts } from './featured-products/featured-products';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    PromotionalBanner,
    FeaturedCategories,
    FeaturedProducts,
    Header,
    Footer
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent {

}
