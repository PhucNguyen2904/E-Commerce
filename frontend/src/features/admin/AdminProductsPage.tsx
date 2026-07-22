import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories } from '../../shared/hooks/adminHooks';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { cn } from '../../shared/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const generateSlug = (str: string) => {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '') // Remove special characters
    .replace(/(\s+)/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Remove consecutive -
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing -
};

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  price: z.number().min(1, 'Giá phải lớn hơn 0'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  gender: z.string().optional(),
  originalPrice: z.number().optional().nullable(),
  discountPercentage: z.number().optional().nullable(),
  imageUrl: z.string().url('URL ảnh không hợp lệ').or(z.literal('')),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const AdminProductsPage = () => {
  const { data: products = [], isLoading, isError } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
    }
  });



  const openCreateModal = () => {
    setEditingProduct(null);
    reset({ name: '', description: '', price: 0, originalPrice: null, discountPercentage: null, categoryId: '', gender: '', imageUrl: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId: product.categoryId || product.category || '',
      gender: product.gender || '',
      originalPrice: product.originalPrice || null,
      discountPercentage: product.discountPercentage || null,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      await deleteProduct(id);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload = { ...data, slug: generateSlug(data.name) };
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: payload });
      } else {
        await createProduct(payload);
      }
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  // Lọc sản phẩm theo search query
  const filteredProducts = isError ? 
    // Dữ liệu mẫu nếu lỗi
    [
      { id: '1', name: 'Áo thun Basic', price: 250000, category: 'Áo', isActive: true, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=100&auto=format&fit=crop' },
      { id: '2', name: 'Quần Jean ống suông', price: 450000, category: 'Quần', isActive: false, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=100&auto=format&fit=crop' }
    ] : 
    products.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
      render: (item: any) => <span className="font-bold">{item.name}</span> 
    },
    { 
      key: 'category', 
      header: 'Danh mục', 
      render: (item: any) => {
        const cat = categories.find((c: any) => c.id === item.categoryId);
        return cat ? cat.name : (item.categoryName || item.categoryId || '-');
      }
    },
    { 
      key: 'price', 
      header: 'Giá', 
      render: (item: any) => <span className="text-primary font-bold">{formatCurrency(item.price)}</span> 
    },
    { 
      key: 'status', 
      header: 'Trạng thái', 
      render: (item: any) => (
        <span className={cn(
          "px-2 py-1 rounded text-label-sm font-bold uppercase",
          item.isActive !== false ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-surface-container-high text-on-surface-variant"
        )}>
          {item.isActive !== false ? 'Đang bán' : 'Đã ẩn'}
        </span>
      ) 
    },
    { 
      key: 'actions', 
      header: 'Hành động', 
      className: 'w-32 text-center',
      render: (item: any) => (
        <div className="flex items-center justify-center gap-1">
          <button 
            onClick={() => openEditModal(item)}
            className="p-2 text-primary hover:bg-primary-container rounded transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            className="p-2 text-error hover:bg-error-container/50 rounded transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-on-surface">Sản phẩm</h1>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={20} />
          <span>Thêm sản phẩm</span>
        </Button>
      </div>

      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2 max-w-md shadow-sm">
        <Search size={20} className="text-on-surface-variant mx-2" />
        <input 
          type="text" 
          placeholder="Tìm kiếm sản phẩm..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-body-md text-on-surface px-2 h-8"
        />
      </div>

      <DataTable 
        columns={columns} 
        data={filteredProducts} 
        isLoading={isLoading} 
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg p-8 w-full max-w-[600px] shadow-ambient max-h-[90vh] overflow-y-auto">
            <h2 className="text-headline-md font-bold mb-6">
              {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input 
                label="Tên sản phẩm" 
                placeholder="VD: Áo sơ mi nam" 
                {...register('name')}
                error={errors.name?.message}
              />
              
              <div className="flex flex-col gap-2">
                <label className="text-label-sm uppercase font-bold text-on-surface-variant">Danh mục</label>
                <select 
                  {...register('categoryId')} 
                  className="h-12 w-full px-4 border border-outline-variant bg-surface-container-lowest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-md"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {(categories.length > 0 ? categories : [{id: '1', name: 'Mặc định'}]).map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                  {errors.categoryId && <span className="text-body-sm text-error">{errors.categoryId.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-label-sm uppercase font-bold text-on-surface-variant">Giới tính</label>
                  <select 
                    {...register('gender')} 
                    className="h-12 w-full px-4 border border-outline-variant bg-surface-container-lowest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-md"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

              <Input 
                label="Giá bán (VNĐ)" 
                type="number"
                placeholder="VD: 250000" 
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Giá gốc (VNĐ)" 
                  type="number"
                  placeholder="VD: 350000" 
                  {...register('originalPrice', { valueAsNumber: true })}
                  error={errors.originalPrice?.message}
                />
                <Input 
                  label="% Giảm giá" 
                  type="number"
                  placeholder="VD: 20" 
                  {...register('discountPercentage', { valueAsNumber: true })}
                  error={errors.discountPercentage?.message}
                />
              </div>

              <Input 
                label="URL Ảnh" 
                placeholder="https://..." 
                {...register('imageUrl')}
                error={errors.imageUrl?.message}
              />

              <div className="flex flex-col gap-2">
                <label className="text-label-sm uppercase font-bold text-on-surface-variant">Mô tả</label>
                <textarea 
                  {...register('description')} 
                  className="w-full p-4 border border-outline-variant bg-surface-container-lowest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-body-md min-h-[100px]"
                  placeholder="Mô tả chi tiết sản phẩm..."
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  {...register('isActive')}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-body-md font-bold text-on-surface cursor-pointer">
                  Đang bán (Hiển thị cho khách hàng)
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Đang lưu...' : 'Lưu lại'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
