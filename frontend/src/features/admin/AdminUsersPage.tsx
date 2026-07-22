import { useState } from 'react';
import { Search, ShieldAlert, Loader2 } from 'lucide-react';
import { useAdminUsers, useUpdateUserRole } from '../../shared/hooks/adminHooks';
import { useAuthStore } from '../../stores/authStore';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { cn } from '../../shared/utils/cn';

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const [emailSearch, setEmailSearch] = useState('');
  
  // Custom hook lấy danh sách (kèm bộ lọc giả lập trên client nếu API thật chưa hỗ trợ, hoặc gửi query params)
  const { data: users = [], isLoading } = useAdminUsers(emailSearch);
  const { mutateAsync: updateRole } = useUpdateUserRole();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      alert('Bạn không thể tự thay đổi quyền của chính mình!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn đổi quyền người dùng này thành ${newRole}? Hành động này ảnh hưởng trực tiếp tới quyền truy cập của họ.`)) {
      try {
        setProcessingId(userId);
        await updateRole({ id: userId, role: newRole });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const columns: Column<any>[] = [
    { key: 'id', header: 'ID', render: (item: any) => <span className="text-on-surface-variant text-body-sm font-mono">#{item.id?.substring(0, 8)}</span> },
    { 
      key: 'user', 
      header: 'Người dùng', 
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-on-surface">{item.name}</span>
          <span className="text-body-sm text-on-surface-variant">{item.email}</span>
        </div>
      ) 
    },
    { 
      key: 'createdAt', 
      header: 'Ngày tham gia', 
      render: (item: any) => new Date(item.createdAt).toLocaleDateString('vi-VN') 
    },
    { 
      key: 'role', 
      header: 'Vai trò (Quyền)', 
      render: (item: any) => {
        const isSelf = currentUser?.id === item.id;
        const isProcessing = processingId === item.id;

        return (
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <div className="flex items-center gap-2 text-primary font-bold text-label-sm">
                <Loader2 size={16} className="animate-spin" />
                Đang đổi...
              </div>
            ) : (
              <div className="relative">
                <select
                  value={item.role}
                  onChange={(e) => handleRoleChange(item.id, e.target.value)}
                  disabled={isSelf || isProcessing}
                  className={cn(
                    "appearance-none bg-surface-container border border-outline-variant rounded px-3 py-1.5 pr-8 text-label-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                    item.role === 'ADMIN' ? "text-error border-error-container" : "text-on-surface",
                    isSelf ? "opacity-50 cursor-not-allowed bg-surface-container-high" : "hover:bg-surface-container-high"
                  )}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                {/* Custom select arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            )}
            
            {isSelf && (
              <span className="text-body-sm text-on-surface-variant flex items-center gap-1" title="Bạn không thể tự hạ cấp chính mình">
                <ShieldAlert size={14} /> (Bạn)
              </span>
            )}
          </div>
        );
      } 
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-on-surface">Người dùng</h1>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg p-2 flex-1 max-w-md">
          <Search size={20} className="text-on-surface-variant mx-2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Email..." 
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-body-md text-on-surface px-2 h-8"
          />
        </div>
        
        <div className="text-body-sm text-on-surface-variant">
          Dữ liệu Người dùng đang được gọi từ Mock API. Đổi quyền sẽ phản ánh lập tức.
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        isLoading={isLoading} 
        emptyMessage="Không tìm thấy người dùng nào phù hợp."
      />
    </div>
  );
};
