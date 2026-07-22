import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Filter } from 'lucide-react';
import { useAdminOrders } from '../../shared/hooks/adminHooks';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const AdminOrdersPage = () => {
  const { data: orders = [], isLoading } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter((o: any) => o.status === statusFilter);

  // Sắp xếp đơn mới nhất lên đầu
  const sortedOrders = [...filteredOrders].sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const columns: Column<any>[] = [
    { 
      key: 'id', 
      header: 'Mã Đơn Hàng',
      render: (item: any) => <span className="font-bold">{item.id}</span>
    },
    { 
      key: 'customer', 
      header: 'Khách hàng',
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-on-surface">{item.shippingInfo?.fullName || 'Khách vãng lai'}</span>
          <span className="text-body-sm text-on-surface-variant">{item.shippingInfo?.phone || ''}</span>
        </div>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Ngày đặt',
      render: (item: any) => new Date(item.createdAt).toLocaleString('vi-VN')
    },
    { 
      key: 'totalAmount', 
      header: 'Tổng tiền',
      render: (item: any) => <span className="font-bold text-primary">{formatCurrency(item.totalAmount)}</span>
    },
    { 
      key: 'status', 
      header: 'Trạng thái',
      render: (item: any) => <OrderStatusBadge status={item.status} />
    },
    { 
      key: 'actions', 
      header: 'Chi tiết',
      className: 'w-24 text-center',
      render: (item: any) => (
        <Link 
          to={`/admin/orders/${item.id}`}
          className="inline-flex p-2 text-primary hover:bg-primary-container rounded transition-colors"
          title="Xem chi tiết"
        >
          <Eye size={20} />
        </Link>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-on-surface">Đơn hàng</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 flex items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-label-sm uppercase">
          <Filter size={18} />
          Lọc theo trạng thái:
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'ALL', label: 'Tất cả' },
            { value: 'PENDING', label: 'Chờ xử lý' },
            { value: 'INVENTORY_RESERVED', label: 'Đang xử lý' },
            { value: 'CONFIRMED', label: 'Thành công' },
            { value: 'FAILED', label: 'Thất bại' },
            { value: 'CANCELLED', label: 'Đã hủy' }
          ].map(status => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-4 py-2 rounded-full text-label-sm font-bold transition-colors ${
                statusFilter === status.value 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={sortedOrders} 
        isLoading={isLoading} 
        emptyMessage="Không tìm thấy đơn hàng nào phù hợp."
      />
    </div>
  );
};
