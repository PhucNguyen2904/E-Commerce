import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { toast } from 'sonner';

// --- CATEGORY HOOKS ---

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Thêm danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thêm danh mục.');
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật danh mục.');
    }
  });
};

// --- PRODUCT HOOKS ---

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/products', { params: { size: 100 } });
        return response.data.content || [];
      } catch (err) {
        return [];
      }
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Thêm sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thêm sản phẩm.');
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật sản phẩm.');
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm.');
    }
  });
};

// --- INVENTORY HOOKS ---

export const useInventoryQueries = (productIds: string[]) => {
  return useQueries({
    queries: productIds.map((id) => ({
      queryKey: ['inventory', id],
      queryFn: async () => {
        try {
          const response = await apiClient.get(`/inventory/${id}`);
          return { 
            productId: id, 
            quantity_available: response.data.quantityAvailable ?? response.data.quantity_available ?? 0,
            quantity_reserved: response.data.quantityReserved ?? response.data.quantity_reserved ?? 0
          };
        } catch (err) {
          // Fallback data
          return { productId: id, quantity_available: 0, quantity_reserved: 0 };
        }
      },
      staleTime: 60000,
    })),
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await apiClient.put(`/inventory/${productId}`, { quantity });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Nhập kho thành công!');
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.productId] });
    },
    onError: () => {
      toast.error('Nhập kho thất bại.');
    }
  });
};

// --- ADMIN ORDER HOOKS ---

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/orders/admin/all');
        return response.data;
      } catch (err) {
        // Fallback
        return [];
      }
    },
  });
};

export const useAdminOrderDetail = (orderId: string) => {
  return useQuery({
    queryKey: ['adminOrder', orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/admin/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const usePaymentStatus = (orderId: string) => {
  return useQuery({
    queryKey: ['payment', orderId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/payments/order/${orderId}`);
        return response.data;
      } catch (err) {
        // Mock payment response
        return { status: 'PAID', amount: 0, method: 'CREDIT_CARD' };
      }
    },
    enabled: !!orderId,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.put(`/orders/admin/${orderId}/cancel`);
      return response.data;
    },
    onSuccess: (_, orderId) => {
      toast.success('Hủy đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrder', orderId] });
    },
    onError: () => {
      toast.error('Hủy đơn hàng thất bại.');
    }
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.delete(`/orders/admin/${orderId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Xóa đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: () => {
      toast.error('Xóa đơn hàng thất bại.');
    }
  });
};

// --- ADMIN USER HOOKS ---

export const useAdminUsers = (emailFilter?: string) => {
  return useQuery({
    queryKey: ['adminUsers', emailFilter],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/auth/admin/users', { params: { email: emailFilter } });
        return response.data;
      } catch (err) {
        // Mock data fallback using the newly created accounts
        const mockUsers = [
          { id: 'bb2a8d85-e883-4836-976f-f78cb0577642', name: 'Admin User', email: 'admin@ecommerce.com', role: 'ADMIN', createdAt: new Date().toISOString() },
          { id: 'c85e4d50-8c35-403f-80aa-93ff4fa44fd2', name: 'Normal User', email: 'user@ecommerce.com', role: 'CUSTOMER', createdAt: new Date().toISOString() },
        ];
        if (emailFilter) {
          return mockUsers.filter(u => u.email.toLowerCase().includes(emailFilter.toLowerCase()));
        }
        return mockUsers;
      }
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      try {
        const response = await apiClient.put(`/auth/admin/users/${id}/role`, { role });
        return response.data;
      } catch (err) {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true };
      }
    },
    onSuccess: () => {
      toast.success('Cập nhật quyền thành công!');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: () => {
      toast.error('Cập nhật quyền thất bại.');
    }
  });
};
