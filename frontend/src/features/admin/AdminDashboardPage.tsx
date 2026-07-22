
import { Package, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { useOrderHistory } from '../../shared/hooks/orderHooks';
import { useAdminProducts } from '../../shared/hooks/adminHooks';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const AdminDashboardPage = () => {
  const { data: orders = [], isLoading: loadingOrders } = useOrderHistory();
  const { data: products = [], isLoading: loadingProducts } = useAdminProducts();

  // Tính toán số liệu thống kê
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
  const confirmedRevenue = orders
    .filter((o: any) => o.status === 'CONFIRMED')
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const metrics = [
    { label: 'TỔNG SẢN PHẨM', value: totalProducts, icon: <Package size={24} className="text-primary" /> },
    { label: 'TỔNG ĐƠN HÀNG', value: totalOrders, icon: <ShoppingCart size={24} className="text-secondary" /> },
    { label: 'ĐƠN PENDING', value: pendingOrders, icon: <Clock size={24} className="text-error" /> },
    { label: 'DOANH THU (CONFIRMED)', value: formatCurrency(confirmedRevenue), icon: <DollarSign size={24} className="text-tertiary" /> },
  ];

  const recentOrders = [...orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const orderColumns: Column<any>[] = [
    { key: 'id', header: 'Mã đơn' },
    { 
      key: 'createdAt', 
      header: 'Ngày đặt', 
      render: (item: any) => new Date(item.createdAt).toLocaleDateString('vi-VN') 
    },
    { 
      key: 'totalAmount', 
      header: 'Tổng tiền', 
      render: (item: any) => <span className="font-bold">{formatCurrency(item.totalAmount)}</span> 
    },
    { 
      key: 'status', 
      header: 'Trạng thái', 
      render: (item: any) => <OrderStatusBadge status={item.status} /> 
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-on-surface">Dashboard</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6 flex flex-col gap-4 shadow-sm hover:shadow-ambient transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-label-sm uppercase font-bold text-on-surface-variant tracking-wider">{metric.label}</span>
              <div className="p-2 bg-surface-container rounded-full">
                {metric.icon}
              </div>
            </div>
            <div className="text-headline-lg font-bold text-on-surface">
              {(loadingOrders || loadingProducts) ? <span className="animate-pulse bg-surface-container-low h-8 w-24 block rounded"></span> : metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-headline-md font-bold text-on-surface">Đơn hàng gần đây</h2>
        <DataTable 
          columns={orderColumns} 
          data={recentOrders} 
          isLoading={loadingOrders} 
          emptyMessage="Chưa có đơn hàng nào."
        />
      </div>
    </div>
  );
};
