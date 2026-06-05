import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product._id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product._id
                ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                sku: product.sku,
                stock: product.stock,
                quantity: 1,
                slug: product.slug,
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, qty) => {
        if (qty < 1) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    {
      name: 'chronos-cart',
    }
  )
);

export default useCartStore;
