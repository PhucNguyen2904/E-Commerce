import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCategories, useProducts, type ProductFilters } from '../../../shared/hooks/apiHooks';
import { ProductCard } from '../../../shared/components/ProductCard';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/utils/cn';
import { useAddToCart } from '../../../shared/hooks/cartHooks';
import { useAuthStore } from '../../../stores/authStore';

export const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const { mutate: addToCart } = useAddToCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Sync state with URL params
  const [filters, setFilters] = useState<ProductFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    categoryId: searchParams.get('categoryId') || undefined,
    gender: searchParams.get('gender') || undefined,
    color: searchParams.get('color') || undefined,
    size: searchParams.get('size') || undefined,
    keyword: searchParams.get('keyword') || undefined,
  });

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Update filters when searchParams change
  useEffect(() => {
    setFilters({
      page: parseInt(searchParams.get('page') || '1'),
      categoryId: searchParams.get('categoryId') || undefined,
      gender: searchParams.get('gender') || undefined,
      color: searchParams.get('color') || undefined,
      size: searchParams.get('size') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    });
  }, [searchParams]);

  const { data: productsData, isLoading, isError, refetch } = useProducts(filters);
  const totalItems = productsData?.total || 0;

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('minPrice', minPrice);
    else newParams.delete('minPrice');
    
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    else newParams.delete('maxPrice');
    
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPrice('');
    setMaxPrice('');
  };

  const handleQuickAdd = (product: any) => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/products';
      return;
    }
    addToCart({ productId: product.id, quantity: 1, product });
  };

  return (
    <div className="layout-container section-spacing">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-[280px] shrink-0 flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
            <h2 className="text-headline-md font-bold">Bộ lọc</h2>
            <Filter size={20} className="text-on-surface-variant" />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-3">
            <h3 className="text-label-sm uppercase text-on-surface-variant">Giới Tính</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => updateParam('gender', null)}
                className={cn('text-left text-body-md transition-colors hover:text-primary', !filters.gender ? 'font-bold text-on-surface' : 'text-on-surface-variant')}
              >
                Tất cả
              </button>
              {['Nữ', 'Nam'].map(gender => (
                <button 
                  key={gender}
                  onClick={() => updateParam('gender', gender)}
                  className={cn('text-left text-body-md transition-colors hover:text-primary', filters.gender === gender ? 'font-bold text-on-surface' : 'text-on-surface-variant')}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3">
            <h3 className="text-label-sm uppercase text-on-surface-variant">Danh Mục</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => updateParam('categoryId', null)}
                className={cn('text-left text-body-md transition-colors hover:text-primary', !filters.categoryId ? 'font-bold text-on-surface' : 'text-on-surface-variant')}
              >
                Tất cả sản phẩm
              </button>
              {categories?.map(cat => {
                const facet = productsData?.categoryFacets?.find(f => f.id === cat.id);
                const count = facet ? facet.count : 0;
                return (
                  <button 
                    key={cat.id}
                    onClick={() => updateParam('categoryId', cat.id)}
                    className={cn('text-left text-body-md transition-colors hover:text-primary', filters.categoryId === cat.id ? 'font-bold text-on-surface' : 'text-on-surface-variant')}
                  >
                    {cat.name} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-3">
            <h3 className="text-label-sm uppercase text-on-surface-variant">Mức Giá Tối Đa</h3>
            <div className="flex flex-col gap-2 pt-2">
              <input 
                type="range" 
                min="0" 
                max="10000000" 
                step="100000" 
                value={maxPrice || 10000000} 
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-label-sm text-on-surface-variant font-medium">
                <span>0₫</span>
                <span>{Number(maxPrice || 10000000).toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
            <Button onClick={handlePriceFilter} variant="ghost" className="h-10 mt-2">Áp dụng giá</Button>
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-3">
            <h3 className="text-label-sm uppercase text-on-surface-variant">Màu Sắc</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Đen', class: 'bg-black' },
                { name: 'Trắng', class: 'bg-white border-gray-300 border' },
                { name: 'Xanh Navy', class: 'bg-blue-800' }
              ].map((c) => (
                <button 
                  key={c.name}
                  onClick={() => updateParam('color', filters.color === c.name ? null : c.name)}
                  className={cn('w-8 h-8 rounded-full transition-all', c.class, filters.color === c.name ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110')}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="flex flex-col gap-3">
            <h3 className="text-label-sm uppercase text-on-surface-variant">Kích Cỡ</h3>
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL'].map(size => (
                <button 
                  key={size}
                  onClick={() => updateParam('size', filters.size === size ? null : size)}
                  className={cn(
                    'w-10 h-10 border rounded flex items-center justify-center text-body-md font-semibold transition-colors',
                    filters.size === size ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <Button variant="ghost" fullWidth onClick={clearFilters} className="mt-4">
            XÓA BỘ LỌC
          </Button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low p-4 rounded-lg">
            <span className="text-body-md text-on-surface-variant">
              Hiển thị {productsData ? Math.min((filters.page || 1) * 12, totalItems) : 0} trong số {totalItems} sản phẩm
            </span>
            <div className="flex items-center gap-2">
              <label className="text-body-md">Sắp xếp theo:</label>
              <select className="h-10 px-3 border border-outline-variant rounded bg-surface-container-lowest outline-none focus:border-primary">
                <option>Mới nhất</option>
                <option>Giá tăng dần</option>
                <option>Giá giảm dần</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="aspect-[4/5] bg-surface-variant rounded-lg animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <h3 className="text-headline-md text-error">Không thể tải danh sách sản phẩm.</h3>
              <p className="text-body-md text-on-surface-variant">Có vẻ như máy chủ tìm kiếm đang gặp sự cố. Vui lòng thử lại sau.</p>
              <Button onClick={() => refetch()} variant="ghost">Thử lại</Button>
            </div>
          ) : productsData?.data.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-headline-md text-on-surface-variant">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {productsData?.data.map((product) => (
                <ProductCard key={product.id} product={product} onQuickAdd={handleQuickAdd} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button 
                disabled={productsData.page === 1}
                onClick={() => updateParam('page', (productsData.page - 1).toString())}
                className="w-10 h-10 rounded flex items-center justify-center border border-outline-variant hover:border-primary disabled:opacity-50 disabled:hover:border-outline-variant"
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: productsData.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === productsData.page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateParam('page', pageNum.toString())}
                    className={cn(
                      "w-10 h-10 rounded flex items-center justify-center font-bold transition-colors",
                      isCurrent ? "bg-primary text-white" : "border border-outline-variant text-on-surface hover:border-primary"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                disabled={productsData.page === productsData.totalPages}
                onClick={() => updateParam('page', (productsData.page + 1).toString())}
                className="w-10 h-10 rounded flex items-center justify-center border border-outline-variant hover:border-primary disabled:opacity-50 disabled:hover:border-outline-variant"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
