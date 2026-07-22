import { create } from 'zustand';

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (productId, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === productId);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }
      return { items: [...state.items, { productId, quantity }] };
    });
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));
