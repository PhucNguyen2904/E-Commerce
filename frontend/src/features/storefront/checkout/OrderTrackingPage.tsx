import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, RefreshCw, ShoppingBag, CreditCard, Clock, MapPin, Package } from 'lucide-react';
import { useOrderTracking } from '../../../shared/hooks/orderHooks';
import { OrderStatusBadge } from '../../../shared/components/OrderStatusBadge';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderTracking(id!);

  if (isLoading) {
    return (
      <div className="layout-container section-spacing text-center py-24 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <RefreshCw size={48} className="text-primary animate-spin" />
        <p className="text-title-lg text-on-surface-variant font-medium mt-4">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="layout-container section-spacing text-center py-24 flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center text-error mb-4 shadow-lg">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-display-sm font-bold text-on-surface">Không tìm thấy đơn hàng</h2>
        <p className="text-body-lg text-on-surface-variant max-w-md mx-auto">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => navigate('/')} className="mt-6 px-10 h-14 text-title-md rounded-xl">VỀ TRANG CHỦ</Button>
      </div>
    );
  }

  const isFailed = order.status === 'FAILED' || order.status === 'CANCELLED';
  const isWaitingPayment = order.status === 'INVENTORY_RESERVED';
  const isSuccess = order.status === 'CONFIRMED' || order.status === 'PENDING';

  return (
    <div className="min-h-screen bg-surface-container-lowest py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* State Banner */}
        <div className="flex flex-col items-center text-center mb-10 gap-4">
          {isSuccess && (
            <>
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-100/50 mb-2">
                <CheckCircle2 size={56} className="animate-in zoom-in duration-500" />
              </div>
              <h1 className="text-display-sm font-extrabold text-on-surface">Đặt hàng thành công!</h1>
              <p className="text-body-lg text-on-surface-variant">Cảm ơn bạn đã mua sắm tại LuxeRetail. Đơn hàng của bạn đang được xử lý.</p>
            </>
          )}

          {isWaitingPayment && (
            <>
              <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-100/50 mb-2">
                <Clock size={56} className="animate-pulse" />
              </div>
              <h1 className="text-display-sm font-extrabold text-on-surface">Đang chờ thanh toán</h1>
              <p className="text-body-lg text-on-surface-variant">Vui lòng hoàn tất thanh toán để chúng tôi giao hàng cho bạn.</p>
            </>
          )}

          {isFailed && (
            <>
              <div className="w-24 h-24 bg-error-container text-error rounded-full flex items-center justify-center shadow-lg shadow-error-container/50 mb-2">
                <AlertCircle size={56} />
              </div>
              <h1 className="text-display-sm font-extrabold text-error">Đơn hàng đã bị hủy</h1>
              <p className="text-body-lg text-on-error-container">{order.failedReason || 'Đã xảy ra lỗi trong quá trình xử lý.'}</p>
            </>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-outline-variant/50 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
            <div className="flex flex-col gap-1">
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Mã đơn hàng</p>
              <h2 className="text-headline-sm font-bold text-primary">#ORD-{order.id.split('-')[0].toUpperCase()}</h2>
              <p className="text-body-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <OrderStatusBadge status={order.status} className="px-5 py-2 text-label-lg font-bold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              
              <div>
                <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  <MapPin size={18} /> Địa chỉ giao hàng
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 text-body-md text-on-surface">
                  <p className="font-semibold mb-1">{order.shippingInfo?.fullName || 'Khách hàng'}</p>
                  <p className="text-on-surface-variant mb-1">{order.shippingInfo?.phone}</p>
                  <p>{order.shippingAddress}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  <CreditCard size={18} /> Phương thức thanh toán
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 text-body-md font-medium text-on-surface flex items-center justify-between">
                  <span>{order.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPay' : 'Thanh toán khi nhận hàng (COD)'}</span>
                </div>
              </div>

            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                <Package size={18} /> Tóm tắt đơn hàng
              </div>
              
              <div className="flex flex-col gap-3 bg-surface-container-lowest border border-outline-variant/20 p-5 rounded-xl shadow-sm">
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {order.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between items-center text-body-md border-b border-outline-variant/10 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {item.quantity}x
                        </span>
                        <span className="truncate max-w-[150px] md:max-w-[180px] font-medium text-on-surface">{item.productName}</span>
                      </div>
                      <span className="font-semibold text-on-surface">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-dashed border-outline-variant/40 pt-4 mt-2">
                  <div className="flex justify-between text-body-md text-on-surface-variant mb-2">
                    <span>Tổng tiền hàng</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-body-md text-on-surface-variant mb-4">
                    <span>Phí giao hàng</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-outline-variant/20 pt-4">
                    <span className="text-title-lg font-bold text-on-surface">Tổng cộng</span>
                    <span className="text-headline-md font-black text-primary">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          {isWaitingPayment && (
            <Button 
              onClick={() => navigate(`/payment/${order.id}`)}
              className="px-10 h-14 text-title-md rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform"
            >
              TIẾP TỤC THANH TOÁN
            </Button>
          )}
          <Button 
            onClick={() => navigate('/products')} 
            variant={isWaitingPayment ? 'outlined' : 'filled'} 
            className="px-10 h-14 text-title-md rounded-xl"
          >
            TIẾP TỤC MUA SẮM
          </Button>
          <Button 
            onClick={() => navigate('/account/orders')} 
            variant="ghost" 
            className="px-10 h-14 text-title-md rounded-xl text-on-surface-variant hover:bg-surface-variant/50"
          >
            XEM LỊCH SỬ ĐƠN HÀNG
          </Button>
        </div>

      </div>
    </div>
  );
};
