import { create } from 'zustand';
import api from '../services/api';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
    weight?: string;
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  total: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (phone?: string) => Promise<number>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  total: 0,

  fetchCart: async () => {
    try {
      const res = await api.get('/cart');
      const items = res.data?.items || [];
      const total = items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0);
      set({ items, total });
    } catch {
      set({ items: [], total: 0 });
    }
  },

  addItem: async (productId, quantity = 1) => {
    await api.post('/cart', { productId, quantity });
    await get().fetchCart();
  },

  updateItem: async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity });
    await get().fetchCart();
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    await get().fetchCart();
  },

  clearCart: async () => {
    await api.delete('/cart');
    set({ items: [], total: 0 });
  },

  checkout: async (phone?: string) => {
    const { items } = get();
    const payload = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      phone: phone || undefined,
    };
    const res = await api.post('/orders', payload);
    set({ items: [], total: 0 });
    return res.data.orderId;
  },
}));
