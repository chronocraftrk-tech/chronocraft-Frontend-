import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add a product to wishlist (ignore duplicates)
      addItem: (product) => {
        const { items } = get();
        if (items.find((i) => i.id === product._id)) return; // already in wishlist
        set({
          items: [
            ...items,
            {
              id:            product._id,
              name:          product.name,
              slug:          product.slug,
              brand:         product.brand,
              price:         product.price,
              originalPrice: product.originalPrice || null,
              images:        product.images || [],
              sku:           product.sku,
              movement:      product.movement || '',
              caseSize:      product.caseSize || null,
              condition:     product.condition || '',
              stock:         product.stock ?? 1,
              addedAt:       new Date().toISOString(),
            },
          ],
        });
      },

      // Remove by product id
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      // Toggle — add if not present, remove if already wishlisted
      toggleItem: (product) => {
        const { items, addItem, removeItem } = get();
        if (items.find((i) => i.id === product._id)) {
          removeItem(product._id);
        } else {
          addItem(product);
        }
      },

      // Check if a product is already wishlisted
      isWishlisted: (id) => {
        return get().items.some((i) => i.id === id);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'chronos-wishlist', // persisted in localStorage
    }
  )
);

export default useWishlistStore;
