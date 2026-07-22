import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories, useCreateCategory, useUpdateCategory } from '../../shared/hooks/adminHooks';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const AdminCategoriesPage = () => {
  const { data: categories = [], isLoading, isError } = useCategories();
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({ name: '', slug: '', parentId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data });
      } else {
        await createCategory(data);
      }
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Tên danh mục', render: (item: any) => <span className="font-bold">{item.name}</span> },
    { key: 'slug', header: 'Slug', className: 'text-on-surface-variant' },
    { key: 'parentId', header: 'Danh mục cha', render: (item: any) => item.parentId ? categories.find((c: any) => c.id === item.parentId)?.name || item.parentId : '-' },
    { 
      key: 'actions', 
      header: 'Hành động', 
      className: 'w-24 text-center',
      render: (item: any) => (
        <button 
          onClick={() => openEditModal(item)}
          className="p-2 text-primary hover:bg-primary-container rounded transition-colors"
        >
          <Edit2 size={18} />
        </button>
      ) 
    },
  ];

  // Fallback data in case backend fails
  const displayData = isError ? [
    { id: '1', name: 'Nam', slug: 'nam' },
    { id: '2', name: 'Nữ', slug: 'nu' },
    { id: '3', name: 'Áo thun', slug: 'ao-thun', parentId: '1' },
  ] : categories;

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-on-surface">Danh mục</h1>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={20} />
          <span>Thêm danh mục</span>
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={displayData} 
        isLoading={isLoading} 
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg p-8 w-full max-w-[500px] shadow-ambient">
            <h2 className="text-headline-md font-bold mb-6">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input 
                label="Tên danh mục" 
                placeholder="VD: Quần áo nam" 
                {...register('name')}
                error={errors.name?.message}
              />
              <Input 
                label="Slug" 
                placeholder="VD: quan-ao-nam" 
                {...register('slug')}
                error={errors.slug?.message}
              />
              
              <div className="flex flex-col gap-2">
                <label className="text-label-sm uppercase font-bold text-on-surface-variant">Danh mục cha</label>
                <select 
                  {...register('parentId')} 
                  className="h-12 w-full px-4 border border-outline-variant bg-surface-container-lowest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-body-md"
                >
                  <option value="">-- Không có --</option>
                  {displayData.filter((c: any) => c.id !== editingCategory?.id).map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
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
