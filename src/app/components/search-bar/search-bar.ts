import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-search-bar',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './search-bar.html',
    styleUrl: './search-bar.css',
})
export class SearchBarComponent {
    keyword: string = '';

    constructor(private router: Router) { }

    onSearch(): void {
        const trimmed = this.keyword.trim();
        if (trimmed) {
            this.router.navigate(['/products'], { queryParams: { search: trimmed } });
        }
    }
}
