import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, ProductDTO } from '../../services/product';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CartService } from '../../services/cart';
import { CategoryService, CategoryDTO } from '../../services/category';
import { ToastService } from '../../services/toast';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './product-list.html',
    styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
    products = signal<ProductDTO[]>([]);
    keyword = signal<string>('');
    minPrice = signal<number | undefined>(undefined);
    maxPrice = signal<number | undefined>(undefined);
    categoryId = signal<number | undefined>(undefined);
    minRating = signal<number | undefined>(undefined);
    minDiscount = signal<number | undefined>(undefined);
    categories = signal<CategoryDTO[]>([]);
    loading = signal<boolean>(false);

    // Pagination
    currentPage = signal<number>(0);
    totalPages = signal<number>(0);
    totalElements = signal<number>(0);
    pageSize = 12;

    // Sort
    sortOption = signal<string>('productId_asc');

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private categoryService: CategoryService,
        private toastService: ToastService,
        private location: Location,
        private route: ActivatedRoute
    ) { }

    goBack(): void {
        this.location.back();
    }

    ngOnInit(): void {
        this.loadCategories();
        this.route.queryParams.subscribe(params => {
            if (params['search']) {
                this.keyword.set(params['search']);
            }
            this.currentPage.set(0);
            this.fetchProducts();
        });
    }

    loadCategories(): void {
        this.categoryService.getAllCategories().subscribe({
            next: (res) => this.categories.set(res.data)
        });
    }

    private getSortParams(): { sortBy: string; direction: string } {
        const parts = this.sortOption().split('_');
        const direction = parts[parts.length - 1]; // 'asc' or 'desc'
        const sortBy = parts.slice(0, parts.length - 1).join('_'); // handle compound names
        return { sortBy, direction };
    }

    /**
     * Single unified fetch method — always respects all active state:
     * keyword, categoryId, minPrice, maxPrice, sortBy, direction, currentPage.
     *
     * Decision logic:
     *   - If keyword is set AND no price/category filters → searchProducts (with sort)
     *   - If category or price filters are set (with or without keyword) → filterProducts (with sort + keyword)
     *   - Otherwise → getAllProducts (with sort)
     */
    fetchProducts(): void {
        this.loading.set(true);
        const { sortBy, direction } = this.getSortParams();
        const kw = this.keyword().trim();
        const hasFilters = this.categoryId() !== undefined ||
            this.minPrice() !== undefined ||
            this.maxPrice() !== undefined ||
            this.minRating() !== undefined ||
            this.minDiscount() !== undefined;

        if (hasFilters) {
            // Use filterProducts — supports category, price, rating, discount, keyword (via backend search+filter)
            this.productService.filterProducts(
                {
                    minPrice: this.minPrice(),
                    maxPrice: this.maxPrice(),
                    categoryId: this.categoryId(),
                    minRating: this.minRating(),
                    minDiscount: this.minDiscount(),
                    // pass keyword too if present
                    ...(kw ? { keyword: kw } : {})
                },
                this.currentPage(), this.pageSize, sortBy, direction
            ).subscribe({
                next: (res) => {
                    this.products.set(res.data.content);
                    this.totalPages.set(res.data.totalPages);
                    this.totalElements.set(res.data.totalElements);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        } else if (kw) {
            // Keyword-only search with sort
            this.productService.searchProducts(kw, this.currentPage(), this.pageSize, sortBy, direction).subscribe({
                next: (res) => {
                    this.products.set(res.data.content);
                    this.totalPages.set(res.data.totalPages);
                    this.totalElements.set(res.data.totalElements);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        } else {
            // No filters, no keyword — load all with sort
            this.productService.getAllProducts(this.currentPage(), this.pageSize, sortBy, direction).subscribe({
                next: (res) => {
                    this.products.set(res.data.content);
                    this.totalPages.set(res.data.totalPages);
                    this.totalElements.set(res.data.totalElements);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        }
    }

    /** Called when user types in search box and submits */
    onSearch(): void {
        this.currentPage.set(0);
        this.fetchProducts();
    }

    /** Called when user applies price/category filters */
    onFilter(): void {
        this.currentPage.set(0);
        this.fetchProducts();
    }

    /** Called when sort dropdown changes — keeps all active filters */
    onSortChange(): void {
        this.currentPage.set(0);
        this.fetchProducts();
    }

    goToPage(page: number): void {
        if (page >= 0 && page < this.totalPages()) {
            this.currentPage.set(page);
            this.fetchProducts();
        }
    }

    previousPage(): void {
        this.goToPage(this.currentPage() - 1);
    }

    nextPage(): void {
        this.goToPage(this.currentPage() + 1);
    }

    addToCart(product: ProductDTO): void {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            this.toastService.success('Please login to add items to cart');
            return;
        }
        this.cartService.addItemToCart(Number(userId), product.productId!, 1).subscribe({
            next: () => this.toastService.success('Product added to cart!'),
            error: (err) => console.error(err)
        });
    }

    clearFilters(): void {
        this.keyword.set('');
        this.minPrice.set(undefined);
        this.maxPrice.set(undefined);
        this.categoryId.set(undefined);
        this.minRating.set(undefined);
        this.minDiscount.set(undefined);
        this.currentPage.set(0);
        this.fetchProducts();
    }
}
