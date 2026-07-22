import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'Không có dữ liệu',
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  
  if (isLoading) {
    return (
      <div className="w-full border border-outline-variant/30 rounded-lg overflow-hidden bg-surface-container-lowest">
        <div className="p-8 flex justify-center items-center h-48 animate-pulse text-on-surface-variant">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30">
              {columns.map((col) => (
                <th key={col.key} className={cn("py-3 px-6 text-label-sm uppercase font-bold text-on-surface-variant", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-body-md text-on-surface-variant">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index} className="border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("py-4 px-6 text-body-md text-on-surface", col.className)}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages && totalPages > 1 && onPageChange && currentPage && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/30 bg-surface-container-lowest">
          <span className="text-body-sm text-on-surface-variant">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="w-8 h-8 rounded flex items-center justify-center border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="w-8 h-8 rounded flex items-center justify-center border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
