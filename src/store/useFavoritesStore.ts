import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product.types';

interface FavoritesState {
  favorites: Product[];
  favoriteIds: number[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
  removeFavorite: (productId: number) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteIds: [],

      toggleFavorite: (product: Product) => {
        const { favorites, favoriteIds } = get();
        const exists = favoriteIds.includes(product.id);

        if (exists) {
          set({
            favorites: favorites.filter((p) => p.id !== product.id),
            favoriteIds: favoriteIds.filter((id) => id !== product.id),
          });
        } else {
          set({
            favorites: [product, ...favorites],
            favoriteIds: [product.id, ...favoriteIds],
          });
        }
      },

      isFavorite: (productId: number) => {
        return get().favoriteIds.includes(productId);
      },

      removeFavorite: (productId: number) => {
        const { favorites, favoriteIds } = get();
        set({
          favorites: favorites.filter((p) => p.id !== productId),
          favoriteIds: favoriteIds.filter((id) => id !== productId),
        });
      },

      clearFavorites: () => {
        set({ favorites: [], favoriteIds: [] });
      },
    }),
    {
      name: 'dhabayih_favorites_storage',
    }
  )
);
