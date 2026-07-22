import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLogin } from '../../shared/hooks/authHooks';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const user = useAuthStore((state: any) => state.user);
  const { mutateAsync: login, isPending, error } = useLogin();
  
  const redirect = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Nếu đã đăng nhập, tự động chuyển hướng
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN' && redirect === '/') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirect, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirect]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      // login store is handled in the hook's onSuccess,
      // the effect above will redirect once isAuthenticated becomes true
    } catch (err: any) {
      // Báo lỗi cụ thể nếu API trả về 400/401
      console.error('Login failed', err);
    }
  };

  return (
    <div className="layout-container section-spacing flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-8 shadow-ambient flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-display-sm font-bold text-on-surface">Đăng nhập</h1>
          <p className="text-body-md text-on-surface-variant">Chào mừng bạn quay lại với LuxeRetail</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container text-body-sm p-3 rounded text-center font-semibold">
            {(error as any)?.response?.data?.message || 'Email hoặc mật khẩu không chính xác'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input 
            label="Email" 
            placeholder="nhapemail@example.com" 
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input 
            label="Mật khẩu" 
            placeholder="••••••••" 
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-label-sm text-primary hover:underline font-semibold">Quên mật khẩu?</Link>
          </div>

          <Button type="submit" disabled={isPending} className="h-12 mt-2 font-bold text-[16px]">
            {isPending ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </Button>
        </form>

        <p className="text-center text-body-md text-on-surface-variant mt-2">
          Chưa có tài khoản?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
