import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]); // array of vehicle objects

  // Load from localStorage whenever user changes
  useEffect(() => {
    if (!user) { setWishlist([]); return; }
    const stored = localStorage.getItem(`wishlist_${user.user_id || user.id || user.email}`);
    setWishlist(stored ? JSON.parse(stored) : []);
  }, [user]);

  // Persist to localStorage on every change
  const persist = useCallback((list) => {
    if (!user) return;
    localStorage.setItem(`wishlist_${user.user_id || user.id || user.email}`, JSON.stringify(list));
  }, [user]);

  const addToWishlist = useCallback((vehicle) => {
    setWishlist(prev => {
      if (prev.find(v => v.vehicle_id === vehicle.vehicle_id)) return prev;
      const next = [...prev, vehicle];
      persist(next);
      return next;
    });
  }, [persist]);

  const removeFromWishlist = useCallback((vehicleId) => {
    setWishlist(prev => {
      const next = prev.filter(v => v.vehicle_id !== vehicleId);
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleWishlist = useCallback((vehicle) => {
    setWishlist(prev => {
      const exists = prev.find(v => v.vehicle_id === vehicle.vehicle_id);
      const next = exists
        ? prev.filter(v => v.vehicle_id !== vehicle.vehicle_id)
        : [...prev, vehicle];
      persist(next);
      return next;
    });
  }, [persist]);

  const isWishlisted = useCallback((vehicleId) => {
    return wishlist.some(v => v.vehicle_id === vehicleId);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
