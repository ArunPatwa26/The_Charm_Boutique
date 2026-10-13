import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';

import {
  getCart,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  clearCartAPI,
} from '../services/cartService';

import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const initialState = {
  items: [],
  total_items: 0,
  subtotal: 0,
  loading: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload?.items || [],
        total_items: action.payload?.total_items || 0,
        subtotal: action.payload?.subtotal || 0,
        loading: false,
      };

    case 'ADD_ITEM':
      return {
        ...state,
        items: action.payload?.items || [],
        total_items: action.payload?.total_items || 0,
        subtotal: action.payload?.subtotal || 0,
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: action.payload?.items || [],
        total_items: action.payload?.total_items || 0,
        subtotal: action.payload?.subtotal || 0,
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: action.payload?.items || [],
        total_items: action.payload?.total_items || 0,
        subtotal: action.payload?.subtotal || 0,
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total_items: 0,
        subtotal: 0,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState
  );

  const { isAuthenticated, loading: authLoading } = useAuth();

  // ==========================================
  // LOAD CART ONLY AFTER AUTH IS KNOWN
  // ==========================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      dispatch({
        type: 'CLEAR_CART',
      });

      dispatch({
        type: 'SET_LOADING',
        payload: false,
      });

      return;
    }

    loadCart();
  }, [isAuthenticated, authLoading]);

  // ==========================================
  // LOAD CART
  // ==========================================

  const loadCart = async () => {
    // Never call cart API if user is logged out
    if (!isAuthenticated) {
      dispatch({
        type: 'CLEAR_CART',
      });
      return;
    }

    try {
      dispatch({
        type: 'SET_LOADING',
        payload: true,
      });

      const response = await getCart();

      if (response?.success) {
        dispatch({
          type: 'SET_CART',
          payload: response.cart || {},
        });
      } else {
        dispatch({
          type: 'CLEAR_CART',
        });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);

      // Don't show an error for authentication problems
      if (
        error?.status !== 401 &&
        error?.status !== 403 &&
        error?.detail !== 'Not authenticated'
      ) {
        toast.error(
          error?.message || 'Failed to load cart'
        );
      }

      dispatch({
        type: 'CLEAR_CART',
      });
    } finally {
      dispatch({
        type: 'SET_LOADING',
        payload: false,
      });
    }
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = async (
    productId,
    quantity = 1
  ) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }

    try {
      const response = await addToCartAPI(
        productId,
        quantity
      );

      if (response?.success) {
        dispatch({
          type: 'ADD_ITEM',
          payload: response.cart || {},
        });

        toast.success('Item added to cart!');
        return true;
      }

      return false;
    } catch (error) {
      toast.error(
        error?.message ||
          error?.detail ||
          'Failed to add item to cart'
      );

      return false;
    }
  };

  // ==========================================
  // UPDATE CART ITEM
  // ==========================================

  const updateCartItem = async (
    productId,
    quantity
  ) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return false;
    }

    try {
      const response =
        await updateCartItemAPI(
          productId,
          quantity
        );

      if (response?.success) {
        dispatch({
          type: 'UPDATE_ITEM',
          payload: response.cart || {},
        });

        return true;
      }

      return false;
    } catch (error) {
      toast.error(
        error?.message ||
          error?.detail ||
          'Failed to update cart'
      );

      return false;
    }
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const response =
        await removeFromCartAPI(productId);

      if (response?.success) {
        dispatch({
          type: 'REMOVE_ITEM',
          payload: response.cart || {},
        });

        toast.success('Item removed from cart');
        return true;
      }

      return false;
    } catch (error) {
      toast.error(
        error?.message ||
          error?.detail ||
          'Failed to remove item'
      );

      return false;
    }
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = async () => {
    if (!isAuthenticated) {
      dispatch({
        type: 'CLEAR_CART',
      });

      return false;
    }

    try {
      const response = await clearCartAPI();

      if (response?.success) {
        dispatch({
          type: 'CLEAR_CART',
        });

        toast.success('Cart cleared');
        return true;
      }

      return false;
    } catch (error) {
      toast.error(
        error?.message ||
          error?.detail ||
          'Failed to clear cart'
      );

      return false;
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const getCartTotal = () => {
    return state.subtotal || 0;
  };

  const getItemCount = () => {
    return state.total_items || 0;
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemCount,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within a CartProvider'
    );
  }

  return context;
};