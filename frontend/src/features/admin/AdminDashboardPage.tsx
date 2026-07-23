import { Package, ShoppingCart, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { useAdminOrders, useAdminProducts } from '../../shared/hooks/adminHooks';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { OrderStatusBadge } from '../../shared/components/OrderStatusBadge';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const AdminDashboardPage = () => {
  const { data: orders = [], isLoading: loadingOrders } = useAdminOrders();
  const { data: products = [], isLoading: loadingProducts } = useAdminProducts();

  // Tính toán số liệu thống kê
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
  const confirmedRevenue = orders
    .filter((o: any) => o.status === 'CONFIRMED')
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const metrics = [
    { 
      label: 'TỔNG SẢN PHẨM', 
      value: totalProducts, 
      icon: <Package size={24} className="text-primary-fixed" />,
      bgIcon: 'bg-primary-fixed/20',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'TỔNG ĐƠN HÀNG', 
      value: totalOrders, 
      icon: <ShoppingCart size={24} className="text-secondary" />,
      bgIcon: 'bg-secondary-container',
      trend: '+5%',
      trendUp: true
    },
    { 
      label: 'ĐƠN PENDING', 
      value: pendingOrders, 
      icon: <Clock size={24} className="text-error" />,
      bgIcon: 'bg-error-container',
      trend: '-2%',
      trendUp: false
    },
    { 
      label: 'DOANH THU (CONFIRMED)', 
      value: formatCurrency(confirmedRevenue), 
      icon: <DollarSign size={24} className="text-tertiary" />,
      bgIcon: 'bg-tertiary-container',
      trend: '+18%',
      trendUp: true
    },
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
      render: (item: any) => <span className="font-bold text-primary">{formatCurrency(item.totalAmount)}</span> 
    },
    { 
      key: 'status', 
      header: 'Trạng thái', 
      render: (item: any) => <OrderStatusBadge status={item.status} /> 
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface tracking-tight">Dashboard Overview</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="group bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            {/* Soft gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <span className="text-label-sm font-bold text-on-surface-variant tracking-wider">{metric.label}</span>
              <div className={`p-3 rounded-xl ${metric.bgIcon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {metric.icon}
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col gap-1 mt-2">
              <div className="text-headline-lg font-extrabold text-on-surface tracking-tight">
                {(loadingOrders || loadingProducts) ? (
                  <span className="animate-pulse bg-surface-container-low h-10 w-32 block rounded-md"></span>
                ) : (
                  metric.value
                )}
              </div>
              
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`flex items-center text-label-sm font-bold ${metric.trendUp ? 'text-[#059669]' : 'text-error'}`}>
                  {metric.trendUp ? <TrendingUp size={14} className="mr-0.5" /> : null}
                  {metric.trend}
                </span>
                <span className="text-body-sm text-on-surface-variant">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="flex flex-col gap-6 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
            Đơn hàng gần đây
          </h2>
          <button className="text-label-sm text-primary font-bold hover:text-primary-container transition-colors uppercase tracking-wider">
            Xem tất cả
          </button>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden p-1">
          <DataTable 
            columns={orderColumns} 
            data={recentOrders} 
            isLoading={loadingOrders} 
            emptyMessage="Chưa có đơn hàng nào."
          />
        </div>
      </div>
    </div>
  );
};
