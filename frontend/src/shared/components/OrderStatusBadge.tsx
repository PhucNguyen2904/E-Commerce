import { cn } from '../utils/cn';

export type OrderStatus = 'PENDING' | 'INVENTORY_RESERVED' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; colorClass: string }> = {
  PENDING: { label: 'Chờ xử lý', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  INVENTORY_RESERVED: { label: 'Đang xử lý', colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  CONFIRMED: { label: 'Thành công', colorClass: 'bg-green-100 text-green-800 border-green-200' },
  FAILED: { label: 'Thất bại', colorClass: 'bg-red-100 text-red-800 border-red-200' },
  CANCELLED: { label: 'Đã hủy', colorClass: 'bg-red-100 text-red-800 border-red-200' },
};

export const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'px-2 py-1 text-[12px] font-bold uppercase rounded border',
        config.colorClass,
        className
      )}
    >
      {config.label}
    </span>
  );
};
