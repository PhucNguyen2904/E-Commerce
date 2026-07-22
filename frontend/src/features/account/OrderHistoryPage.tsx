import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { useOrderHistory } from '../../shared/hooks/orderHooks';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';
import { Button } from '../../shared/components/Button';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const OrderHistoryPage = () => {
  const { data: orders, isLoading, isError } = useOrderHistory();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-display-lg-mobile md:text-display-lg font-bold">Lịch sử đơn hàng</h2>
        <div className="animate-pulse h-64 bg-surface-container-low rounded-xl"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-display-lg-mobile md:text-display-lg font-bold">Lịch sử đơn hàng</h2>
        <div className="bg-error-container/30 p-6 rounded-xl border border-error-container text-center">
          <p className="text-error font-semibold">Không thể tải danh sách đơn hàng. (Có thể Backend chưa bật).</p>
        </div>
      </div>
    );
  }

  const isEmpty = !orders || orders.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-display-lg-mobile md:text-display-lg font-bold">Lịch sử đơn hàng</h2>
      
      {isEmpty ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-ambient flex flex-col items-center justify-center gap-4">
          <ShoppingBag size={48} className="text-on-surface-variant" />
          <h3 className="text-headline-md font-bold text-on-surface">Bạn chưa có đơn hàng nào</h3>
          <p className="text-body-lg text-on-surface-variant">Hãy khám phá các sản phẩm của chúng tôi và đặt hàng ngay.</p>
          <Button onClick={() => window.location.href = '/products'} className="mt-4">
            MUA SẮM NGAY
          </Button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-ambient overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="py-4 px-6 text-body-md font-bold text-on-surface">Mã đơn hàng</th>
                  <th className="py-4 px-6 text-body-md font-bold text-on-surface">Sản phẩm</th>
                  <th className="py-4 px-6 text-body-md font-bold text-on-surface">Ngày đặt</th>
                  <th className="py-4 px-6 text-body-md font-bold text-on-surface">Tổng tiền</th>
                  <th className="py-4 px-6 text-body-md font-bold text-on-surface">Trạng thái</th>
                  <th className="py-4 px-6 text-body-md font-bold text-on-surface text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-outline-variant/20 hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-primary">#ORD-{order.id.split('-')[0].toUpperCase()}</td>
                    <td className="py-4 px-6 text-body-sm text-on-surface-variant max-w-[250px]">
                      <ul className="list-disc list-inside">
                        {order.items?.map((item: any) => (
                          <li key={item.productId} className="truncate" title={item.productName}>
                            {item.quantity}x {item.productName}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-4 px-6 font-bold">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-4 px-6">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 rounded text-primary hover:bg-primary-container transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
