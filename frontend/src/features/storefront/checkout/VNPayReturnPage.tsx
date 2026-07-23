import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { verifyVnPayReturn } from '../../../shared/hooks/orderHooks';
import { Button } from '../../../shared/components/Button';

export const VNPayReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const verifyPayment = async () => {
      try {
        if (!location.search) {
          if (isMounted) setStatus('error');
          return;
        }

        const data = await verifyVnPayReturn(location.search);
        
        if (isMounted) {
          // The backend now returns the real orderId
          setOrderId(data.orderId || data.vnp_TxnRef);
          
          if (data.vnp_ResponseCode === '00') {
            setStatus('success');
            // Auto redirect to order tracking after 2 seconds
            setTimeout(() => {
              if (isMounted && (data.orderId || data.vnp_TxnRef)) {
                navigate(`/orders/${data.orderId || data.vnp_TxnRef}`, { replace: true });
              }
            }, 2000);
          } else {
            setStatus('error');
          }
        }
      } catch (error) {
        console.error('Lỗi khi xác minh thanh toán VNPay:', error);
        if (isMounted) {
          setStatus('error');
        }
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [location.search, navigate]);

  return (
    <div className="layout-container section-spacing text-center py-20 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
      {status === 'loading' && (
        <>
          <RefreshCw size={48} className="text-primary animate-spin" />
          <h2 className="text-headline-sm font-bold text-on-surface">Đang xác minh thanh toán...</h2>
          <p className="text-body-lg text-on-surface-variant">Vui lòng không đóng cửa sổ này.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-primary mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">Thanh toán thành công!</h2>
          <p className="text-body-lg text-on-surface-variant">Đang xác nhận đơn hàng của bạn...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 bg-error-container rounded-full flex items-center justify-center text-error mb-4">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-headline-md font-bold text-error">Thanh toán không thành công hoặc đã bị huỷ</h2>
          <p className="text-body-lg text-on-surface-variant max-w-md mx-auto">
            Giao dịch của bạn không thể hoàn tất. Vui lòng kiểm tra lại trạng thái đơn hàng và thử lại.
          </p>
          <div className="mt-4">
            <Button 
              onClick={() => orderId ? navigate(`/orders/${orderId}`, { replace: true }) : navigate('/')} 
              className="px-8"
            >
              {orderId ? 'QUAY LẠI ĐƠN HÀNG' : 'VỀ TRANG CHỦ'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
