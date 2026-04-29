import { createContext, useContext } from 'react';
import { useWishlistStore } from '../store';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  return (
    <WishlistContext.Provider value={null}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const items      = useWishlistStore(s => s.items);
  const addItem    = useWishlistStore(s => s.addItem);
  const removeItem = useWishlistStore(s => s.removeItem);
  const hasItem    = useWishlistStore(s => s.hasItem);
  const clear      = useWishlistStore(s => s.clear);
  return { items, addItem, removeItem, hasItem, clear };
}
