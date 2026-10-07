import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoritesState = {
  productIds: string[];
  toggleFavorite: (productId: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      productIds: [],
      toggleFavorite: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
    }),
    {
      name: 'oweji-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
