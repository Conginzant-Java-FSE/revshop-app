import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container mt-5 pt-5">
      <div class="card shadow-sm border-0 p-4 rounded-4 text-center">
        <i class="fa-solid fa-heart fs-1 text-danger mb-3"></i>
        <h2>My Favorites</h2>
        <p class="text-muted">Manage your favorite products here. (Coming soon)</p>
      </div>
    </div>
  `
})
export class FavoritesComponent { }
