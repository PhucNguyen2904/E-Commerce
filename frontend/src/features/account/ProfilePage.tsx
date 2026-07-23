import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '../../shared/hooks/authHooks';
import { Input } from '../../shared/components/Input';
import { Loader2 } from 'lucide-react';

export const ProfilePage = () => {
  const { data: profile, isLoading, isError } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });

  // Cập nhật form data khi lấy được profile
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-surface-container-low rounded-xl"></div>;
  }

  if (isError || !profile) {
    return (
      <div className="bg-error-container/30 p-6 rounded-xl border border-error-container text-center">
        <p className="text-error font-semibold">Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-display-lg-mobile md:text-display-lg font-bold">Hồ sơ cá nhân</h2>
      
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 md:p-8 shadow-ambient">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-outline-variant/30">
          <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center text-display-sm font-bold">
            {profile.fullName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <h3 className="text-headline-md font-bold text-on-surface">{profile.fullName || 'Người dùng'}</h3>
            <span className="text-body-md text-on-surface-variant uppercase tracking-wider">{profile.role || 'Thành viên'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-label-sm uppercase text-on-surface-variant font-bold">Họ và tên</label>
            <Input 
              name="fullName"
              value={formData.fullName} 
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-label-sm uppercase text-on-surface-variant font-bold">Email</label>
            <Input value={profile.email || ''} readOnly className="bg-surface-container-low cursor-not-allowed opacity-70" />
          </div>
          
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-label-sm uppercase text-on-surface-variant font-bold">Số điện thoại</label>
            <Input 
              name="phone"
              value={formData.phone} 
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </div>
          
          <div className="md:col-span-2 flex justify-end mt-4">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating && <Loader2 size={20} className="animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};
