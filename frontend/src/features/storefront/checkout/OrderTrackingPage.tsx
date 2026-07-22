import { useParams } from 'react-router-dom';
import { Package, CheckCircle2, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { useOrderTracking } from '../../../shared/hooks/orderHooks';
import { OrderStatusBadge } from '../../../shared/components/OrderStatusBadge';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderTracking(id!);

  if (isLoading) {
    return (
      <div className="layout-container section-spacing text-center py-20 flex flex-col items-center justify-center gap-4">
        <RefreshCw size={32} className="text-primary animate-spin" />
        <p className="text-body-lg text-on-surface-variant">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="layout-container section-spacing text-center py-20 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-error" />
        <h2 className="text-headline-md font-bold text-on-surface">Không tìm thấy đơn hàng</h2>
        <p className="text-body-lg text-on-surface-variant">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => window.location.href = '/'} className="mt-4">VỀ TRANG CHỦ</Button>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Đã đặt hàng', icon: <ShoppingBag size={20} /> },
    { key: 'INVENTORY_RESERVED', label: 'Đã giữ hàng', icon: <Package size={20} /> },
    { key: 'CONFIRMED', label: 'Hoàn tất', icon: <CheckCircle2 size={20} /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  // Nếu status là CONFIRMED, currentStepIndex = 2. Nếu INVENTORY_RESERVED, = 1.
  const isFailed = order.status === 'FAILED' || order.status === 'CANCELLED';

  return (
    <div className="layout-container section-spacing max-w-4xl">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 shadow-ambient flex flex-col gap-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-md md:text-display-lg-mobile font-bold text-on-surface">Mã đơn hàng: <span className="text-primary">#ORD-{order.id.split('-')[0].toUpperCase()}</span></h1>
            <p className="text-body-md text-on-surface-variant">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          </div>
          <OrderStatusBadge status={order.status} className="w-max text-sm px-4 py-2" />
        </div>

        {/* Timeline */}
        {isFailed ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 bg-error-container/30 rounded-lg border border-error-container">
            <AlertCircle size={48} className="text-error" />
            <h2 className="text-headline-md font-bold text-error">Đơn hàng đã bị hủy</h2>
            <p className="text-body-md text-on-error-container">{order.failedReason || 'Đã xảy ra lỗi trong quá trình xử lý.'}</p>
          </div>
        ) : (
          <div className="py-8 relative">
            <div className="flex items-center justify-between relative z-10">
              {steps.map((step, index) => {
                // index <= currentStepIndex (or if CONFIRMED everything is active)
                const isPast = index < currentStepIndex || order.status === 'CONFIRMED';
                const isCurrent = index === currentStepIndex && order.status !== 'CONFIRMED';

                return (
                  <div key={step.key} className="flex flex-col items-center gap-3 w-1/3 relative">
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors z-10",
                        isPast ? "bg-primary border-primary text-white" :
                        isCurrent ? "bg-primary-fixed border-primary text-primary" : "bg-surface-container border-outline-variant text-on-surface-variant"
                      )}
                    >
                      {step.icon}
                      {isCurrent && <span className="absolute inset-0 rounded-full shadow-[0_0_0_8px] shadow-primary/20 animate-pulse"></span>}
                    </div>
                    <span className={cn(
                      "text-body-md font-bold text-center",
                      isPast || isCurrent ? "text-primary" : "text-on-surface-variant"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Connecting Lines */}
            <div className="absolute top-14 left-[16.66%] right-[16.66%] h-[2px] bg-outline-variant/30 -z-0">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ 
                  width: order.status === 'CONFIRMED' ? '100%' : order.status === 'INVENTORY_RESERVED' ? '50%' : '0%' 
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-outline-variant/30 pt-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-body-lg font-bold text-on-surface">Thông tin giao hàng</h3>
            <div className="flex flex-col gap-1 text-body-md text-on-surface-variant">
              <p><span className="font-semibold text-on-surface">Địa chỉ giao hàng:</span></p>
              <p>{order.shippingAddress}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-body-lg font-bold text-on-surface">Tóm tắt thanh toán</h3>
            <div className="flex justify-between text-body-md text-on-surface-variant">
              <span>Tổng tiền hàng ({order.items.length} sản phẩm)</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex flex-col gap-2 mt-2 bg-surface-container-low p-4 rounded-lg">
              {order.items.map((item: any) => (
                <div key={item.productId} className="flex justify-between text-body-sm">
                  <span className="truncate max-w-[200px]">{item.quantity}x {item.productName}</span>
                  <span className="font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-body-md text-on-surface-variant border-b border-outline-variant/30 pb-2">
              <span>Phí giao hàng</span>
              <span>Miễn phí</span>
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-body-lg font-bold text-on-surface">Tổng cộng</span>
              <span className="text-headline-md font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button onClick={() => window.location.href = '/products'} variant="ghost" className="px-8">
            TIẾP TỤC MUA SẮM
          </Button>
        </div>

      </div>
    </div>
  );
};
