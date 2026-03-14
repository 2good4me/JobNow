import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUpdateEmployerProfile, useUploadCompanyLogo } from '@/features/auth/hooks/useEmployerProfile';
import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Building2, Globe, MapPin, Phone, Save, Camera, FileText, Hash, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';


export const Route = createFileRoute('/employer/profile/edit')({
  component: EmployerEditProfilePage,
});

const profileEditSchema = z.object({
  phone: z.string().trim().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ').or(z.literal('')),
  companyWebsite: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Website phải là URL hợp lệ (http/https)')
    .or(z.literal('')),
  companyTaxId: z
    .string()
    .trim()
    .regex(/^\d{10}(\d{3})?$/, 'Mã số thuế phải gồm 10 hoặc 13 chữ số')
    .or(z.literal('')),
});

function EmployerEditProfilePage() {
  const { userProfile: user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateEmployerProfile();
  const { mutateAsync: uploadLogo, isPending: isUploadingLogo } = useUploadCompanyLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    companyName: user?.company_name || '',
    companyDescription: user?.company_description || '',
    companyWebsite: user?.company_website || '',
    companyTaxId: (user as any)?.company_tax_id || '',
    industry: (user as any)?.industry || '',
    address: user?.address_text || '',
    phone: user?.phone_number || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadLogo(file);
      toast.success('Tải logo thành công');
    } catch (err) {
      toast.error('Lỗi khi tải lên logo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = profileEditSchema.safeParse({
      phone: formData.phone,
      companyWebsite: formData.companyWebsite,
      companyTaxId: formData.companyTaxId,
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ');
      return;
    }

    try {
      await updateProfile({
        company_name: formData.companyName,
        company_description: formData.companyDescription,
        company_website: formData.companyWebsite,
        company_tax_id: formData.companyTaxId,
        industry: formData.industry,
        address_text: formData.address,
        phone_number: formData.phone,
      });
      toast.success('Cập nhật hồ sơ thành công');
      navigate({ to: '/employer/profile' });
    } catch (err) {
      toast.error('Lỗi cập nhật hồ sơ');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans max-w-lg mx-auto w-full relative shadow-sm">
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-10 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <button onClick={() => navigate({ to: '/employer/profile' })} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-2">Chỉnh sửa hồ sơ</h1>
        </div>
        <button onClick={handleSubmit} disabled={isUpdating} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 h-8 px-4 text-xs text-white rounded-md transition duration-200 disabled:opacity-50 font-medium">
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {isUpdating ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Logo Upload */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed ${isUploadingLogo ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
              {user?.company_logo_url ? (
                <img src={user.company_logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-300" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white transition-transform group-hover:scale-110">
              <Camera className="w-4 h-4" />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Nhấn để thay đổi logo công ty</p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Thông tin chung</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                Tên công ty
              </label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Nhập tên gọi công ty..." className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                Mô tả ngắn
              </label>
              <textarea name="companyDescription" value={formData.companyDescription} onChange={handleChange} placeholder="Giới thiệu về công ty..." className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-400" />
                Mã số thuế (MST)
              </label>
              <input name="companyTaxId" value={formData.companyTaxId} onChange={handleChange} placeholder="012345xxxx" className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Ngành nghề
              </label>
              <input name="industry" value={formData.industry} onChange={handleChange} placeholder="VD: F&B, Bán lẻ, Sản xuất..." className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Liên hệ & Địa chỉ</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                Số điện thoại
              </label>
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxx..." className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                Website
              </label>
              <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://..." className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                Địa chỉ
              </label>
              <input name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, đường, quận..." className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
