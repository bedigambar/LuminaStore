import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.product === action.payload.product);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product === action.payload.product
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }

    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.product === action.payload.productId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ).filter((i) => i.quantity > 0),
      };

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.product !== action.payload) };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

const STORAGE_KEY = 'luminastore_cart';

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    cartReducer,
    { items: [] },
    (init) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { items: JSON.parse(stored) } : init;
      } catch {
        return init;
      }
    }
  );

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const updateQty = (productId, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { productId, quantity } });
  const removeItem = (productId) => dispatch({ type: 'REMOVE_ITEM', payload: productId });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const setCart = (items) => dispatch({ type: 'SET_CART', payload: items });

  return (
    <CartContext.Provider value={{
      items: state.items, totalItems, totalPrice,
      addItem, updateQty, removeItem, clearCart, setCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
