import { useQuery, useMutation } from '@tanstack/react-query';
import { type CartItem } from './cartHooks';

export type OrderStatus = 'PENDING' | 'INVENTORY_RESERVED' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

export interface Order {
  id: string;
  status: OrderStatus;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  failedReason?: string;
}

import { apiClient } from '../api/axios';

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (payload: { shippingAddress: string, paymentMethod: string }) => {
      const response = await apiClient.post('/orders', payload);
      return response.data;
    }
  });
};

export const useOrderTracking = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    },
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      if (status === 'CONFIRMED' || status === 'FAILED' || status === 'CANCELLED') {
        return false;
      }
      return 2000;
    },
    enabled: !!orderId,
  });
};

export const useOrderHistory = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // Gọi API thực tế
      const response = await apiClient.get('/orders');
      return response.data;
    },
  });
};
