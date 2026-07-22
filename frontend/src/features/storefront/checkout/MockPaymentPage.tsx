import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { useOrderTracking } from '../../../shared/hooks/orderHooks';
import { apiClient } from '../../../shared/api/axios';
import { toast } from 'sonner';
import { CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export const MockPaymentPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderTracking(orderId || '');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (order && order.paymentStatus === 'PAID') {
      navigate(`/orders/${order.id}`);
    }
  }, [order, navigate]);

  if (isLoading) {
    return <div className="layout-container section-spacing text-center">Đang tải thông tin thanh toán...</div>;
  }

  if (isError || !order) {
    return <div className="layout-container section-spacing text-center text-error font-bold">Không tìm thấy đơn hàng</div>;
  }

  const handlePayment = async () => {
    try {
      setIsPaying(true);
      // Giả lập API gọi lên server để cập nhật trạng thái payment
      await apiClient.put(`/orders/${orderId}/pay`);
      
      toast.success('Thanh toán thành công!');
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 1500);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thanh toán.');
      setIsPaying(false);
    }
  };

  return (
    <div className="layout-container section-spacing max-w-2xl">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-ambient flex flex-col items-center text-center gap-6 relative overflow-hidden">
        
        {/* Banner */}
        <div className="absolute top-0 left-0 w-full bg-primary py-3 text-white font-bold flex justify-center items-center gap-2">
          <ShieldCheck size={20} /> CỔNG THANH TOÁN AN TOÀN
        </div>

        <div className="mt-8">
          <h1 className="text-headline-md font-bold text-on-surface mb-2">Thanh toán VNPAY</h1>
          <p className="text-body-md text-on-surface-variant">Quét mã QR dưới đây hoặc bấm Xác nhận để thanh toán</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm inline-block">
          <QrCode size={160} className="text-on-surface" />
        </div>

        <div className="flex flex-col gap-2 w-full mt-4 bg-surface-container-low p-6 rounded-lg text-left">
          <div className="flex justify-between border-b border-outline-variant/30 pb-3">
            <span className="text-on-surface-variant">Mã đơn hàng</span>
            <span className="font-bold text-primary">#ORD-{order.id.split('-')[0].toUpperCase()}</span>
          </div>
          <div className="flex justify-between border-b border-outline-variant/30 py-3">
            <span className="text-on-surface-variant">Tên khách hàng</span>
            <span className="font-bold line-clamp-1 text-right max-w-[200px]">{order.shippingAddress?.split(',')?.[0] || 'Khách hàng'}</span>
          </div>
          <div className="flex justify-between pt-3 text-headline-sm">
            <span className="text-on-surface-variant">Số tiền thanh toán</span>
            <span className="font-bold text-primary">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
            </span>
          </div>
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={isPaying} 
          variant="accent"
          className="w-full h-14 text-body-lg mt-4 flex gap-2 items-center justify-center"
        >
          {isPaying ? 'ĐANG XỬ LÝ...' : <><CheckCircle2 size={24} /> XÁC NHẬN ĐÃ THANH TOÁN</>}
        </Button>
        
        <button 
          onClick={() => navigate(`/orders/${orderId}`)} 
          className="text-on-surface-variant hover:text-error text-body-md font-semibold transition-colors mt-2"
        >
          Hủy thanh toán
        </button>

      </div>
    </div>
  );
};
