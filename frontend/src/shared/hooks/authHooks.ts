import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

export const useLogin = () => {
  const loginStore = useAuthStore(state => state.login);
  
  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      let user = data.user;
      if (!user && data.accessToken) {
        try {
          const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
          user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            name: payload.name || payload.email,
          };
        } catch (e) {
          console.error('Failed to decode JWT', e);
        }
      }
      
      loginStore(user, data.accessToken, data.refreshToken);
      toast.success('Đăng nhập thành công!');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
    },
  });
};

export const useProfile = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
    enabled: isAuthenticated, // Chỉ gọi khi đã đăng nhập
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fullName: string; phone: string }) => {
      const response = await apiClient.put('/auth/me', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật hồ sơ thành công!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ.');
    }
  });
};
