import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from './Button';

export const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-error-container text-error rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-display-lg font-black text-on-surface mb-2">403</h1>
      <h2 className="text-headline-lg font-bold text-on-surface mb-4">Truy cập bị từ chối</h2>
      <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
        Bạn không có quyền hạn cần thiết để truy cập vào khu vực này. Vui lòng đăng nhập với tài khoản Quản trị viên.
      </p>
      <Link to="/">
        <Button className="flex items-center gap-2">
          <Home size={20} />
          Trở về Trang chủ
        </Button>
      </Link>
    </div>
  );
};
