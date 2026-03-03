import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../services/favorite';
import { Favorite } from '../../models/favorite.model';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class FavoritesComponent implements OnInit {
  favorites = signal<Favorite[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private favoriteService: FavoriteService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.favoriteService.getFavorites(Number(userId)).subscribe({
        next: (res) => {
          this.favorites.set(res.data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  removeFavorite(productId: number): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.favoriteService.removeFromFavorite(Number(userId), productId).subscribe({
        next: () => {
          this.toastService.success('Removed from favorites');
          this.loadFavorites();
        }
      });
    }
  }
}
