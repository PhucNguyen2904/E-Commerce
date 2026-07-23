import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, CreditCard, AlertTriangle, Trash2 } from 'lucide-react';
import { useAdminOrderDetail, usePaymentStatus, useCancelOrder, useDeleteOrder } from '../../shared/hooks/adminHooks';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';
import { Button } from '../../shared/components/Button';
import { DataTable, type Column } from '../../shared/components/DataTable';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Gọi song song (parallel queries) thông qua React Query
  const { data: order, isLoading: loadingOrder, isError: orderError } = useAdminOrderDetail(id || '');
  const { data: payment, isLoading: loadingPayment } = usePaymentStatus(id || '');
  
  const { mutateAsync: cancelOrder, isPending: isCanceling } = useCancelOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  const handleCancelOrder = async () => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.')) {
      await cancelOrder(id!);
    }
  };

  if (loadingOrder || loadingPayment) {
    return <div className="animate-pulse h-96 bg-surface-container-low rounded-xl"></div>;
  }

  if (orderError || !order) {
    return (
      <div className="bg-error-container/30 p-6 rounded-xl border border-error-container text-center">
        <p className="text-error font-semibold">Không tìm thấy thông tin đơn hàng.</p>
        <Button onClick={() => navigate('/admin/orders')} className="mt-4">Quay lại danh sách</Button>
      </div>
    );
  }

  const columns: Column<any>[] = [
    { key: 'productId', header: 'Mã Sản Phẩm', render: (item: any) => <span className="text-on-surface-variant">{item.productId}</span> },
    { key: 'price', header: 'Đơn giá', render: (item: any) => <span>{formatCurrency(item.price)}</span> },
    { key: 'quantity', header: 'Số lượng', render: (item: any) => <span className="font-bold text-lg">{item.quantity}</span> },
    { key: 'total', header: 'Thành tiền', render: (item: any) => <span className="font-bold text-primary">{formatCurrency(item.price * item.quantity)}</span> },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 rounded hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-display-sm font-bold text-on-surface">Đơn hàng #{order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        
        {/* Nút hủy đơn chỉ hiện khi đơn đang PENDING */}
        {order.status === 'PENDING' && (
          <Button 
            variant="ghost"
            className="text-error border-error hover:bg-error-container"
            onClick={handleCancelOrder}
            disabled={isCanceling}
          >
            <AlertTriangle size={18} className="mr-2" />
            {isCanceling ? 'Đang hủy...' : 'HỦY ĐƠN HÀNG'}
          </Button>
        )}
        <Button 
          variant="ghost"
          className="text-white bg-error hover:bg-error/90 border-error ml-2"
          onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này? Không thể hoàn tác!')) {
              deleteOrder(id!, { onSuccess: () => navigate('/admin/orders') });
            }
          }}
          disabled={isDeleting}
        >
          <Trash2 size={18} className="mr-2" />
          {isDeleting ? 'Đang xóa...' : 'XÓA ĐƠN HÀNG'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin khách hàng */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-title-md border-b border-outline-variant/30 pb-4">
            <User size={20} /> Khách hàng
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-body-lg font-bold">{order.shippingInfo?.fullName || 'Khách vãng lai'}</p>
            <p className="text-body-md text-on-surface-variant">{order.shippingInfo?.phone || 'Chưa cung cấp SĐT'}</p>
          </div>
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-title-md border-b border-outline-variant/30 pb-4">
            <MapPin size={20} /> Giao hàng tới
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-body-md text-on-surface">{order.shippingInfo?.address || 'Chưa cung cấp địa chỉ'}</p>
          </div>
        </div>

        {/* Trạng thái thanh toán */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-title-md border-b border-outline-variant/30 pb-4">
            <CreditCard size={20} /> Thanh toán
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface-variant">Trạng thái:</span>
              <span className={`px-2 py-1 rounded text-label-sm font-bold uppercase ${
                payment?.status === 'PAID' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {payment?.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface-variant">Phương thức:</span>
              <span className="text-body-md font-bold">{payment?.method || 'Thanh toán khi nhận hàng'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-headline-md font-bold text-on-surface">Chi tiết sản phẩm</h2>
        <DataTable 
          columns={columns} 
          data={order.items || []} 
          emptyMessage="Không có sản phẩm nào trong đơn hàng."
        />
        <div className="flex justify-end p-4 bg-surface-container-low rounded-lg mt-2">
          <div className="flex items-center gap-4 text-headline-sm">
            <span className="text-on-surface-variant">Tổng cộng:</span>
            <span className="font-bold text-primary text-display-sm">{formatCurrency(order.totalAmount || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
