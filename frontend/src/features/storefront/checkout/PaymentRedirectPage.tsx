import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderTracking } from '../../../shared/hooks/orderHooks';
import { apiClient } from '../../../shared/api/axios';
import { toast } from 'sonner';
import { Button } from '../../../shared/components/Button';
import { ShieldCheck, ArrowRight, Wallet, User, Phone, MapPin, Package, CreditCard } from 'lucide-react';

export const PaymentRedirectPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderTracking(orderId || '');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (order && order.paymentStatus === 'PAID') {
      navigate(`/orders/${order.id}`);
    }
  }, [order, navigate]);

  if (isLoading) {
    return (
      <div className="layout-container section-spacing flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="layout-container section-spacing text-center py-24">
        <h2 className="text-headline-md font-bold text-error mb-4">Không tìm thấy đơn hàng</h2>
        <Button onClick={() => navigate('/products')} variant="ghost" className="mx-auto">Quay lại Cửa hàng</Button>
      </div>
    );
  }

  const handleProceedToPayment = async () => {
    setIsRedirecting(true);
    if (order.paymentMethod === 'VNPAY') {
      try {
        const response = await apiClient.get(`/payments/order/${orderId}/vnpay-url`);
        if (response.data && response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
           toast.error('Không lấy được URL thanh toán.');
           setIsRedirecting(false);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi kết nối cổng thanh toán VNPAY.');
        setIsRedirecting(false);
      }
    } else {
      navigate(`/orders/${orderId}`);
    }
  };

  const fullName = order.shippingInfo?.fullName || 'Khách vãng lai';
  const phone = order.shippingInfo?.phone || 'Chưa cung cấp';
  const address = order.shippingInfo?.address || order.shippingAddress || 'Chưa cung cấp địa chỉ';
  const products = order.items?.map((item: any) => `${item.productName} (x${item.quantity})`).join(', ') || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-container-lowest via-surface to-primary/5 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-3xl w-full z-10">
        <div className="backdrop-blur-xl bg-surface-container-lowest/80 border border-white/40 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center gap-8 relative overflow-hidden">
          
          {/* Header Banner */}
          <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-primary to-secondary py-3 text-white font-bold flex justify-center items-center gap-2 shadow-md">
            <ShieldCheck size={20} className="animate-pulse" /> 
            <span className="tracking-wide">THANH TOÁN AN TOÀN VỚI VNPAY</span>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-primary/10">
              <Wallet size={36} />
            </div>
            <div>
              <h1 className="text-display-sm md:text-display-md font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant mb-2">
                Xác Nhận Đơn Hàng
              </h1>
              <p className="text-body-lg text-on-surface-variant">
                Vui lòng kiểm tra kỹ thông tin bên dưới trước khi tiến hành thanh toán
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 dark:border-white/5 shadow-inner flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                  <User size={16} /> Người nhận
                </div>
                <span className="text-title-md font-semibold text-on-surface">{fullName}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                  <Phone size={16} /> Số điện thoại
                </div>
                <span className="text-title-md font-semibold text-on-surface">{phone}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                <MapPin size={16} /> Địa chỉ giao hàng
              </div>
              <span className="text-body-lg text-on-surface leading-relaxed">{address}</span>
            </div>

            <hr className="border-outline-variant/30" />

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                <Package size={16} /> Sản phẩm
              </div>
              <span className="text-body-lg font-medium text-on-surface">{products}</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                <CreditCard size={16} /> Phương thức thanh toán
              </div>
              <span className="text-body-lg font-bold text-on-surface">Thẻ ATM / Tài khoản ngân hàng (VNPAY)</span>
            </div>

            <div className="mt-4 p-5 bg-primary/5 rounded-xl border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-title-lg text-on-surface-variant font-medium">Tổng thanh toán:</span>
              <span className="text-display-sm font-black text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
              </span>
            </div>
            
          </div>

          <div className="w-full flex flex-col gap-4 mt-4">
            <Button 
              onClick={handleProceedToPayment} 
              disabled={isRedirecting} 
              className="w-full h-16 text-title-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-3 relative overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              
              {isRedirecting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  ĐANG KẾT NỐI...
                </div>
              ) : (
                <>
                  CHUYỂN TỚI CỔNG THANH TOÁN VNPAY <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            <button 
              onClick={() => navigate(`/orders/${orderId}`)} 
              className="text-on-surface-variant hover:text-primary text-body-lg font-semibold transition-colors py-2 flex items-center justify-center gap-2 group"
            >
              <ArrowRight size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              Bỏ qua và xem chi tiết đơn hàng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
