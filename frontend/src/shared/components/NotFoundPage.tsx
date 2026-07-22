import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from './Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-[120px] font-black text-primary leading-none mb-4">404</h1>
      <h2 className="text-display-md font-bold text-on-surface mb-2">Trang không tồn tại</h2>
      <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
        Có vẻ như bạn đã đi lạc. Đường dẫn bạn đang cố truy cập không tồn tại hoặc đã bị di dời.
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
