import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  itemsByUser: Record<string, CartItem[]>;
  addItem: (userId: string, item: CartItem) => void;
  removeItem: (userId: string, itemId: number) => void;
  clearCart: (userId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      itemsByUser: {},
      addItem: (userId, item) => set((state) => {
        const userItems = state.itemsByUser[userId] || [];
        const existing = userItems.find((i) => i.id === item.id);
        
        if (existing) {
          const updatedItems = userItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
          return { itemsByUser: { ...state.itemsByUser, [userId]: updatedItems } };
        }
        
        return { itemsByUser: { ...state.itemsByUser, [userId]: [...userItems, { ...item, quantity: 1 }] } };
      }),
      removeItem: (userId, itemId) => set((state) => {
        const userItems = state.itemsByUser[userId] || [];
        return {
          itemsByUser: {
            ...state.itemsByUser,
            [userId]: userItems.filter((i) => i.id !== itemId),
          }
        };
      }),
      clearCart: (userId) => set((state) => ({ 
        itemsByUser: { ...state.itemsByUser, [userId]: [] }
      })),
    }),
    { name: 'cart-storage' }
  )
);


