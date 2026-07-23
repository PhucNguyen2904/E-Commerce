import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Product } from '../components/ProductCard';
import { apiClient } from '../api/axios';
import { useAuthStore } from '../../stores/authStore';

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface CartData {
  items: CartItem[];
  totalPrice: number;
  originalTotalPrice?: number;
  discountCode?: string;
}

export const useCart = () => {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  return useQuery({
    queryKey: ['cart'],
    queryFn: async (): Promise<CartData | null> => {
      if (!isAuthenticated) return null;
      try {
        const response = await apiClient.get('/cart');
        const items = response.data?.items || [];
        
        const mappedItems = items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          product: {
            id: item.productId,
            name: item.productName,
            price: item.productPrice,
            imageUrl: item.imageUrl,
            category: ''
          }
        })) as CartItem[];

        return {
          items: mappedItems,
          totalPrice: response.data?.totalPrice || 0,
          originalTotalPrice: response.data?.originalTotalPrice,
          discountCode: response.data?.discountCode
        };
      } catch (error) {
        return null;
      }
    },
    enabled: isAuthenticated
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity: number, product?: any }) => {
      await apiClient.post('/cart/items', { productId, quantity });
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity: number }) => {
      await apiClient.put(`/cart/items/${productId}`, { productId, quantity });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await apiClient.delete(`/cart/items/${productId}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/cart');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useApplyDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discountCode: string) => {
      await apiClient.post('/cart/discount', { discountCode });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};
