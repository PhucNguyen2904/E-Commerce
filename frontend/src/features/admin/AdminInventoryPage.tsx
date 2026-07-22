import { useState } from 'react';
import { PackagePlus, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminProducts, useInventoryQueries, useUpdateInventory } from '../../shared/hooks/adminHooks';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { cn } from '../../shared/utils/cn';

const addStockSchema = z.object({
  quantity: z.preprocess((val) => Number(val), z.number().min(1, 'Số lượng phải lớn hơn 0')),
});

export const AdminInventoryPage = () => {
  const { data: products = [], isLoading: loadingProducts } = useAdminProducts();
  const productIds = products.map((p: any) => p.id);
  
  const inventoryQueries = useInventoryQueries(productIds);
  const { mutateAsync: updateInventory, isPending: isUpdating } = useUpdateInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addStockSchema),
    defaultValues: { quantity: 1 }
  });

  const isLoadingInventory = inventoryQueries.some((q: any) => q.isLoading);

  const combinedData = products.map((product: any) => {
    const invQuery = inventoryQueries.find((q: any) => q.data?.productId === product.id);
    const invData = invQuery?.data || { quantity_available: 0, quantity_reserved: 0 };
    return {
      ...product,
      ...invData,
    };
  });

  const openAddStockModal = (product: any) => {
    setSelectedProduct(product);
    reset({ quantity: 1 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const onSubmit = async (data: any) => {
    if (!selectedProduct) return;
    try {
      await updateInventory({ productId: selectedProduct.id, quantity: data.quantity });
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: Column<any>[] = [
    { 
      key: 'image', 
      header: 'Ảnh', 
      className: 'w-16',
      render: (item: any) => (
        <div className="w-10 h-10 rounded overflow-hidden bg-surface-container">
          {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
        </div>
      ) 
    },
    { 
      key: 'name', 
      header: 'Tên sản phẩm', 
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold">{item.name}</span>
          <span className="text-body-sm text-on-surface-variant">ID: #{item.id?.substring(0, 8)}</span>
        </div>
      ) 
    },
    { 
      key: 'quantity_available', 
      header: 'Sẵn có', 
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold text-headline-sm",
            item.quantity_available < 5 ? "text-error" : "text-primary"
          )}>
            {item.quantity_available}
          </span>
          {item.quantity_available < 5 && (
            <AlertCircle size={16} className="text-error" />
          )}
        </div>
      ) 
    },
    { 
      key: 'quantity_reserved', 
      header: 'Đang giữ', 
      render: (item: any) => <span className="text-on-surface-variant font-medium">{item.quantity_reserved}</span> 
    },
    { 
      key: 'actions', 
      header: 'Hành động', 
      className: 'w-32 text-center',
      render: (item: any) => (
        <Button 
          variant="ghost" 
          onClick={() => openAddStockModal(item)}
          className="text-primary hover:bg-primary-container p-2"
          title="Nhập thêm kho"
        >
          <PackagePlus size={20} />
        </Button>
      ) 
    },
  ];

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-on-surface">Tồn kho</h1>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 text-body-sm text-on-surface-variant flex items-center gap-2">
        <AlertCircle size={16} />
        Dữ liệu tồn kho đang được join trực tiếp. Chú ý các sản phẩm có badge đỏ (sắp hết hàng).
      </div>

      <DataTable 
        columns={columns} 
        data={combinedData} 
        isLoading={loadingProducts || isLoadingInventory} 
      />

      {/* Modal Nhập kho */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg p-8 w-full max-w-[400px] shadow-ambient">
            <h2 className="text-headline-md font-bold mb-2">Nhập kho</h2>
            <p className="text-body-md text-on-surface-variant mb-6">Sản phẩm: <span className="font-bold text-on-surface">{selectedProduct.name}</span></p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input 
                label="Số lượng nhập thêm" 
                type="number"
                {...register('quantity')}
                error={errors.quantity?.message as string}
              />
              
              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Đang nhập...' : 'Nhập kho'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
