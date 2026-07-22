import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-surface-container border-t border-outline-variant/30 mt-auto">
      <div className="layout-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-headline-md font-bold text-primary">LuxeRetail</h3>
            <p className="text-body-md text-on-surface-variant">
              Nâng tầm phong cách sống với những bộ sưu tập thời trang cao cấp, tinh tế và độc đáo.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-body-lg font-bold text-on-surface">Cửa hàng</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-body-md text-on-surface-variant hover:text-primary">Tất cả sản phẩm</Link>
              <Link to="/collections" className="text-body-md text-on-surface-variant hover:text-primary">Bộ sưu tập</Link>
              <Link to="/sale" className="text-body-md text-on-surface-variant hover:text-primary">Hàng giảm giá</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-body-lg font-bold text-on-surface">Hỗ trợ</h4>
            <div className="flex flex-col gap-2">
              <Link to="/faq" className="text-body-md text-on-surface-variant hover:text-primary">Câu hỏi thường gặp</Link>
              <Link to="/shipping" className="text-body-md text-on-surface-variant hover:text-primary">Chính sách giao hàng</Link>
              <Link to="/returns" className="text-body-md text-on-surface-variant hover:text-primary">Đổi trả & Hoàn tiền</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-body-lg font-bold text-on-surface">Liên hệ</h4>
            <div className="flex flex-col gap-2 text-body-md text-on-surface-variant">
              <p>Email: support@luxeretail.com</p>
              <p>Hotline: 1900 1000</p>
              <p>Địa chỉ: 123 Đường Fashion, Quận 1, TP.HCM</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-outline-variant/30 text-center text-body-md text-on-surface-variant">
          <p>&copy; {new Date().getFullYear()} LuxeRetail. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
