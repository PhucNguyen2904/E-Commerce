import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRegister } from '../../shared/hooks/authHooks';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutateAsync: registerUser, isPending, error } = useRegister();
  
  const redirect = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
    } catch (err: any) {
      console.error('Registration failed', err);
    }
  };

  return (
    <div className="layout-container section-spacing flex items-center justify-center min-h-[70vh] py-12">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-8 shadow-ambient flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-display-sm font-bold text-on-surface">Đăng ký</h1>
          <p className="text-body-md text-on-surface-variant">Tạo tài khoản LuxeRetail mới</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container text-body-sm p-3 rounded text-center font-semibold">
            {(error as any)?.response?.data?.message || 'Email đã tồn tại hoặc có lỗi xảy ra'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input 
            label="Họ và tên" 
            placeholder="Nguyễn Văn A" 
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <Input 
            label="Email" 
            placeholder="nhapemail@example.com" 
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input 
            label="Mật khẩu" 
            placeholder="Ít nhất 8 ký tự" 
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input 
            label="Xác nhận mật khẩu" 
            placeholder="••••••••" 
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" disabled={isPending} className="h-12 mt-4 font-bold text-[16px]">
            {isPending ? 'ĐANG TẠO...' : 'TẠO TÀI KHOẢN'}
          </Button>
        </form>

        <p className="text-center text-body-md text-on-surface-variant mt-2">
          Đã có tài khoản?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
