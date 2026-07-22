import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { type Product } from '../components/ProductCard';

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ProductFilters {
  page?: number;
  categoryId?: string;
  gender?: string;
  color?: string;
  size?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  isSale?: boolean;
}

export interface CategoryFacet {
  id: string;
  name: string;
  count: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
  categoryFacets?: CategoryFacet[];
}

export interface InventoryStatus {
  productId: string;
  availableQuantity: number;
  inStock: boolean;
}

export interface ProductDetail extends Product {
  description: string;
  colors?: string[];
  sizes?: string[];
  features?: string[];
  gender?: string;
}

// ---------------------------------------------------------
// Mock Data (To be removed when API is fully integrated)
// ---------------------------------------------------------


const sharedDesc = 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc. Phù hợp cho nhiều hoàn cảnh khác nhau từ công sở đến dạo phố.';
const sharedColors = ['Đen', 'Trắng', 'Xanh Navy'];
const sharedSizes = ['S', 'M', 'L', 'XL'];
const sharedFeatures = ['Chất liệu: 100% Cotton hữu cơ', 'Phom dáng vừa vặn tôn dáng', 'Chống nhăn hiệu quả', 'Thấm hút mồ hôi tốt'];



const baseProducts: ProductDetail[] = [
  { id: 'p1', name: 'Sơ Mi Trắng Egyptian Cotton', price: 1850000, category: 'Áo Sơ Mi', imageUrl: '/products/so-mi-trang-egyptian.jpg', isNew: true, description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p2', name: 'Sơ Mi Chambray Casual', price: 1450000, category: 'Áo Sơ Mi', imageUrl: '/products/so-mi-chambray.jpg', description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p3', name: 'Sơ Mi Sọc Xanh Navy', price: 1650000, category: 'Áo Sơ Mi', imageUrl: '/products/so-mi-soc-navy.jpg', isNew: true, description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p4', name: 'Quần Tây Slim-fit Classic', price: 2100000, category: 'Quần Tây', imageUrl: '/products/quan-tay-slim-fit.jpg', description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p5', name: 'Quần Tây Xếp Ly Cao Cấp', price: 2350000, category: 'Quần Tây', imageUrl: '/products/quan-tay-xep-ly.jpg', isNew: true, description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p6', name: 'Blazer Nam Tailored Navy', price: 3450000, category: 'Áo Khoác', imageUrl: '/products/blazer-navy.jpg', description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p7', name: 'Overcoat Lông Cừu Camel', price: 5200000, category: 'Áo Khoác', imageUrl: '/products/overcoat-camel.jpg', isNew: true, description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p8', name: 'Áo Khoác Dạ Nữ Thanh Lịch', price: 4800000, category: 'Áo Khoác', imageUrl: '/products/ao-khoac-da-nu.jpg', description: sharedDesc, colors: sharedColors, sizes: sharedSizes, features: sharedFeatures },
  { id: 'p9', name: 'Thắt Lưng Da Bò Classic', price: 977500, category: 'Phụ Kiện', imageUrl: '/products/that-lung-da-bo.jpg', description: sharedDesc, colors: sharedColors, features: sharedFeatures },
  { id: 'p10', name: 'Túi Da Cao Cấp Classic', price: 4500000, category: 'Phụ Kiện', imageUrl: '/products/tui-da-classic.jpg', isNew: true, description: sharedDesc, colors: sharedColors, features: sharedFeatures },
  { id: 'p11', name: 'Đồng Hồ Bạc Tối Giản', price: 3200000, category: 'Phụ Kiện', imageUrl: '/products/dong-ho-bac.jpg', description: sharedDesc, colors: sharedColors, features: sharedFeatures },
  { id: 'p12', name: 'Cà Vạt Lụa Họa Tiết', price: 650000, category: 'Phụ Kiện', imageUrl: '/products/ca-vat-lua.jpg', description: sharedDesc, colors: sharedColors, features: sharedFeatures },
];

const MOCK_PRODUCTS: ProductDetail[] = [
  ...baseProducts.map(p => ({ ...p, id: p.id + '_nam', gender: 'Nam' })),
  ...baseProducts.map(p => ({ ...p, id: p.id + '_nu', gender: 'Nữ' }))
];

const MOCK_INVENTORY: Record<string, InventoryStatus> = {};
MOCK_PRODUCTS.forEach(p => {
  const qty = Math.floor(Math.random() * 20);
  MOCK_INVENTORY[p.id] = {
    productId: p.id,
    availableQuantity: qty,
    inStock: qty > 0,
  };
});
// ---------------------------------------------------------

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return (await apiClient.get<Category[]>('/categories')).data;
    },
  });
};

export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // Convert frontend 1-indexed page to backend 0-indexed page
      const apiFilters = {
        ...filters,
        q: filters.keyword, // Map keyword to q
        page: filters.page ? filters.page - 1 : 0,
        size: 12 // Request exactly 12 items per page to show all
      };
      // Remove keyword from apiFilters since we use 'q' for search service
      delete apiFilters.keyword;
      
      const response = await apiClient.get('/search/products', { params: apiFilters });
      return {
        data: response.data.items || [],
        total: response.data.totalElements || 0,
        page: filters.page || 1,
        totalPages: response.data.totalPages || 1,
        categoryFacets: (response.data.categoryFacets || []).map((f: any) => ({
          id: f.categoryId,
          name: f.categoryName,
          count: f.count
        }))
      } as PaginatedProducts;
    },
  });
};

export const useSearchSuggestions = (keyword: string) => {
  return useQuery({
    queryKey: ['searchSuggestions', keyword],
    queryFn: async () => {
      if (!keyword.trim()) return [];
      const response = await apiClient.get('/search/products', { 
        params: { q: keyword, size: 5, page: 0 } 
      });
      return response.data.items || [];
    },
    enabled: keyword.trim().length > 0,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      return (await apiClient.get<ProductDetail>(`/products/${id}`)).data;
    },
    enabled: !!id,
  });
};

export const useInventory = (productId: string) => {
  return useQuery({
    queryKey: ['inventory', productId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/inventory/${productId}`);
        const qty = response.data.quantityAvailable || 0;
        return {
          productId,
          availableQuantity: qty,
          inStock: qty > 0
        } as InventoryStatus;
      } catch (e) {
        return { productId, availableQuantity: 0, inStock: false } as InventoryStatus;
      }
    },
    enabled: !!productId,
  });
};
