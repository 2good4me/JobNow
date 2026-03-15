import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserDocument } from '@/lib/firestore';
import { toast } from 'sonner';
import { ArrowLeft, User, Phone, MapPin, AlignLeft, Save, Mail, Calendar, Code, Briefcase, Camera, FileText, Trash2, Check } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

export const Route = createFileRoute('/candidate/profile/edit')({
    component: CandidateProfileEditPage,
});

function CandidateProfileEditPage() {
    const { userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        full_name: userProfile?.full_name || '',
        phone_number: userProfile?.phone_number || '',
        email: userProfile?.email || '',
        bio: userProfile?.bio || '',
        address_text: userProfile?.address_text || '',
        experience: userProfile?.experience || '',
        skills: userProfile?.skills?.join(', ') || '',
        education: userProfile?.education || [],
        certifications: userProfile?.certifications || [],
    });
    const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || '');
    const [resumeUrl, setResumeUrl] = useState(userProfile?.resume_url || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');
            const updatedData = {
                ...data,
                skills: data.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
                avatar_url: avatarUrl,
                resume_url: resumeUrl,
            };
            await updateUserDocument(userProfile.uid, updatedData as any);
        },
        onSuccess: async () => {
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Cập nhật hồ sơ thành công');
            navigate({ to: '/candidate/profile' });
        },
        onError: (error: any) => {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            toast.error(error?.message || 'Có lỗi xảy ra khi lưu thông tin.');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.full_name.trim()) {
            toast.error('Vui lòng nhập họ và tên');
            return;
        }

        updateProfileMutation.mutate(formData);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile?.uid) return;

        try {
            setIsUploading(true);
            const storageRef = ref(storage, `avatars/${userProfile.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setAvatarUrl(url);
            toast.success('Tải ảnh lên thành công');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Không thể tải ảnh lên');
        } finally {
            setIsUploading(false);
        }
    };

    const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile?.uid) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File CV không được quá 5MB');
            return;
        }

        try {
            setIsUploadingResume(true);
            const storageRef = ref(storage, `resumes/${userProfile.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setResumeUrl(url);
            toast.success('Tải CV lên thành công');
        } catch (error) {
            console.error('Resume upload failed:', error);
            toast.error('Không thể tải CV lên');
        } finally {
            setIsUploadingResume(false);
        }
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [
                ...prev.education,
                { school: '', degree: '', field: '', start_date: '', description: '' }
            ]
        }));
    };

    const removeEducation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const handleEducationChange = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newEducation = [...prev.education];
            newEducation[index] = { ...newEducation[index], [field]: value };
            return { ...prev, education: newEducation };
        });
    };

    // Return early or show loading if userProfile is not loaded yet
    if (!userProfile) return null;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans max-w-lg mx-auto w-full relative shadow-sm">
            {/* Navy Header */}
            <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-20 flex items-center justify-between shadow-md">
                <div className="flex items-center">
                    <button 
                        onClick={() => navigate({ to: '/candidate/profile' })} 
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold ml-2">Chỉnh sửa hồ sơ</h1>
                </div>
                <button 
                    onClick={handleSubmit} 
                    disabled={updateProfileMutation.isPending} 
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 h-8 px-4 text-xs text-white rounded-md transition duration-200 disabled:opacity-50 font-medium"
                >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>

            <div className="max-w-md mx-auto p-4 w-full">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full border-4 border-blue-50 flex items-center justify-center overflow-hidden bg-slate-50 shadow-sm relative">
                            {isUploading ? (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : null}
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white transition-transform group-hover:scale-110 cursor-pointer">
                            <Camera className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                        </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 font-medium">Nhấn để thay đổi ảnh đại diện</p>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section: Thông tin cá nhân */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Thông tin cá nhân</h2>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <User className="w-4 h-4 text-slate-400" />
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input 
                                name="full_name" 
                                value={formData.full_name} 
                                onChange={handleChange} 
                                placeholder="Nhập họ và tên..." 
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Ngày sinh (đang bảo trì)
                            </label>
                            <input 
                                type="date"
                                disabled
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-[15px] opacity-50 cursor-not-allowed font-medium" 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <AlignLeft className="w-4 h-4 text-slate-400" />
                                Giới thiệu bản thân
                            </label>
                            <textarea 
                                name="bio" 
                                value={formData.bio} 
                                onChange={handleChange} 
                                placeholder="Chia sẻ một chút về bản thân..." 
                                className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] focus:bg-white min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                            />
                        </div>
                    </div>

                    {/* Section: Kỹ năng & Kinh nghiệm */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Kỹ năng & Kinh nghiệm</h2>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Hồ sơ CV (PDF)
                            </label>
                            <label className={`flex flex-col items-center justify-center h-24 w-full rounded-xl border-2 border-dashed transition-all cursor-pointer ${resumeUrl ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                {isUploadingResume ? (
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                ) : resumeUrl ? (
                                    <div className="flex flex-col items-center text-emerald-600">
                                        <Save className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-bold">Đã tải CV lên</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400">
                                        <Briefcase className="w-6 h-6 mb-1" />
                                        <span className="text-xs">Tải lên hồ sơ của bạn</span>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeChange} disabled={isUploadingResume} />
                            </label>
                            {resumeUrl && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-1 ml-1 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> CV đã được lưu
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <Code className="w-4 h-4 text-slate-400" />
                                Kỹ năng (cách nhau bằng dấu phẩy)
                            </label>
                            <input 
                                name="skills" 
                                value={formData.skills} 
                                onChange={handleChange} 
                                placeholder="VD: Giao tiếp, Tiếng Anh, Pha chế..." 
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Kinh nghiệm làm việc
                            </label>
                            <textarea 
                                name="experience" 
                                value={formData.experience} 
                                onChange={handleChange} 
                                placeholder="Mô tả các công việc bạn đã từng làm..." 
                                className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] focus:bg-white min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                            />
                        </div>
                    </div>

                    {/* Section: Học vấn */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                            <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Học vấn</h2>
                            <button 
                                type="button" 
                                onClick={addEducation}
                                className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                + Thêm trường
                            </button>
                        </div>

                        {formData.education.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-4">Chưa có thông tin học vấn</p>
                        ) : (
                            <div className="space-y-6">
                                {formData.education.map((edu, index) => (
                                    <div key={index} className="relative p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                                        <button 
                                            type="button" 
                                            onClick={() => removeEducation(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">Tên trường</label>
                                            <input 
                                                value={edu.school} 
                                                onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                                placeholder="VD: ĐH Kinh Tế TP.HCM" 
                                                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">Bằng cấp</label>
                                                <input 
                                                    value={edu.degree} 
                                                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                    placeholder="VD: Cử nhân" 
                                                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">Chuyên ngành</label>
                                                <input 
                                                    value={edu.field} 
                                                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                                                    placeholder="VD: Quản trị kinh doanh" 
                                                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section: Liên hệ & Địa chỉ */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Liên hệ & Địa chỉ</h2>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <Mail className="w-4 h-4 text-slate-400" />
                                Email
                            </label>
                            <input 
                                name="email" 
                                value={formData.email} 
                                disabled 
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-[15px] text-slate-500 cursor-not-allowed font-medium" 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <Phone className="w-4 h-4 text-slate-400" />
                                Số điện thoại
                            </label>
                            <input 
                                name="phone_number" 
                                value={formData.phone_number} 
                                onChange={handleChange} 
                                placeholder="09xxxx..." 
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                Địa chỉ
                            </label>
                            <input 
                                name="address_text" 
                                value={formData.address_text} 
                                onChange={handleChange} 
                                placeholder="Ví dụ: Quận 1, TP Hồ Chí Minh" 
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
