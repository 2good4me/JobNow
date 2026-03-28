import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserDocument } from '@/lib/firestore';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, Camera, Check, Plus, Save, Trash2, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

export const Route = createFileRoute('/candidate/profile/edit')({
    component: CandidateProfileEditPage,
});

type ExperienceItem = {
    id: string;
    title: string;
    company: string;
    period: string;
};

type EducationItem = {
    school: string;
    degree: string;
    field: string;
    start_date: string;
    description?: string;
};

type CertificationItem = {
    name: string;
    organization: string;
    issue_date: string;
    expiry_date?: string;
    credential_id?: string;
    credential_url?: string;
};

function parseExperienceItems(value: string | undefined): ExperienceItem[] {
    if (!value?.trim()) return [];

    return value
        .split('\n')
        .map((entry, index) => {
            const [title = '', company = '', period = ''] = entry.split('|').map((part) => part.trim());
            const fallbackTitle = title || company || `Kinh nghiệm ${index + 1}`;

            return {
                id: `exp-${index}-${fallbackTitle}`,
                title: fallbackTitle,
                company: title && company ? company : '',
                period,
            };
        })
        .filter((item) => item.title || item.company || item.period);
}

function stringifyExperienceItems(items: ExperienceItem[]) {
    return items
        .map((item) => [item.title.trim(), item.company.trim(), item.period.trim()].filter(Boolean).join(' | '))
        .filter(Boolean)
        .join('\n');
}

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
        education: (userProfile?.education || []) as EducationItem[],
        certifications: (userProfile?.certifications || []) as CertificationItem[],
    });
    const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || '');
    const [resumeUrl, setResumeUrl] = useState(userProfile?.resume_url || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [birthday, setBirthday] = useState(userProfile?.cccd_dob || '');
    const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
    const [skillDraft, setSkillDraft] = useState('');
    const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>(() => parseExperienceItems(userProfile?.experience));

    const skillItems = useMemo(
        () => formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        [formData.skills]
    );

    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');

            const updatedData = {
                ...data,
                experience: stringifyExperienceItems(experienceItems),
                skills: data.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
                avatar_url: avatarUrl,
                resume_url: resumeUrl,
                cccd_dob: birthday,
            };

            await updateUserDocument(userProfile.uid, updatedData as never);
        },
        onSuccess: async () => {
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Cập nhật hồ sơ thành công');
            navigate({ to: '/candidate/profile' });
        },
        onError: (error: Error) => {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi lưu thông tin.');
        },
    });

    const updateFormValue = (name: keyof typeof formData, value: string | EducationItem[] | CertificationItem[]) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!formData.full_name.trim()) {
            toast.error('Vui lòng nhập họ và tên');
            return;
        }

        updateProfileMutation.mutate({
            ...formData,
        });
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile?.uid) return;

        try {
            setIsUploading(true);
            const storageRef = ref(storage, `avatars/${userProfile.uid}/${file.name}`);
            await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
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
            await uploadBytes(storageRef, file, { contentType: file.type || 'application/pdf' });
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

    const addSkill = () => {
        const normalized = skillDraft.trim();
        if (!normalized) return;

        if (skillItems.some((skill) => skill.toLowerCase() === normalized.toLowerCase())) {
            toast.error('Kỹ năng này đã tồn tại');
            return;
        }

        updateFormValue('skills', [...skillItems, normalized].join(', '));
        setSkillDraft('');
    };

    const removeSkill = (skillToRemove: string) => {
        updateFormValue(
            'skills',
            skillItems.filter((skill) => skill !== skillToRemove).join(', ')
        );
    };

    const addExperience = () => {
        setExperienceItems((prev) => [
            ...prev,
            {
                id: `exp-${Date.now()}`,
                title: '',
                company: '',
                period: '',
            },
        ]);
    };

    const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
        setExperienceItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const removeExperience = (id: string) => {
        setExperienceItems((prev) => prev.filter((item) => item.id !== id));
    };

    const addEducation = () => {
        updateFormValue('education', [
            ...formData.education,
            { school: '', degree: '', field: '', start_date: '', description: '' },
        ]);
    };

    const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
        const newEdu = [...formData.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        updateFormValue('education', newEdu);
    };

    const removeEducation = (index: number) => {
        const newEdu = [...formData.education];
        newEdu.splice(index, 1);
        updateFormValue('education', newEdu);
    };

    if (!userProfile) return null;

    return (
        <div className="min-h-screen bg-[#F7F9FB] font-body text-[#191C1E]">
            <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-[420px] items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate({ to: '/candidate/profile' })}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="font-headline text-lg font-bold tracking-tight text-slate-900">Chỉnh sửa hồ sơ</h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                                Hồ sơ › <span className="text-[#006399]">Chỉnh sửa hồ sơ</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col gap-8 px-5 pb-36 pt-6">
                <section className="flex flex-col items-center">
                    <div className="relative">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)]">
                            {isUploading ? (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#006399] border-t-transparent" />
                                </div>
                            ) : null}
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                                    {formData.full_name.trim().charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#006399] text-white shadow-md transition-transform hover:scale-105">
                            <Camera className="h-4 w-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                        </label>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="space-y-5">
                        <h2 className="font-headline text-base font-bold tracking-tight text-slate-700">Thông tin cá nhân</h2>

                        <div className="space-y-1.5">
                            <label className="ml-1 block text-sm font-medium text-[#45464D]">Họ và tên (*)</label>
                            <input
                                name="full_name"
                                value={formData.full_name}
                                onChange={(e) => updateFormValue('full_name', e.target.value)}
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] outline-none transition-all focus:border-[#006399] focus:ring-4 focus:ring-[#006399]/10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="ml-1 block text-sm font-medium text-[#45464D]">Địa chỉ hiện tại</label>
                            <input
                                name="address_text"
                                value={formData.address_text}
                                onChange={(e) => updateFormValue('address_text', e.target.value)}
                                placeholder="Ghi rõ quận/huyện, thành phố để nhà tuyển dụng dễ tìm kiếm"
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] outline-none transition-all focus:border-[#006399] focus:ring-4 focus:ring-[#006399]/10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="ml-1 block text-sm font-medium text-[#45464D]">Số điện thoại</label>
                            <input
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={(e) => updateFormValue('phone_number', e.target.value)}
                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] outline-none transition-all focus:border-[#006399] focus:ring-4 focus:ring-[#006399]/10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="ml-1 block text-sm font-medium text-[#45464D]">Ngày sinh</label>
                            <div className="relative">
                                <input
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    placeholder="01/01/1995"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-[15px] outline-none transition-all focus:border-[#006399] focus:ring-4 focus:ring-[#006399]/10"
                                />
                                <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="ml-1 block text-sm font-medium text-[#45464D]">Giới tính</label>
                            <div className="flex h-[52px] rounded-3xl bg-[#E6E8EA] p-1">
                                {(['Nam', 'Nữ', 'Khác'] as const).map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setGender(item)}
                                        className={`flex-1 rounded-full text-sm transition-all ${
                                            gender === item
                                                ? 'bg-[#006399] font-bold text-white shadow-sm'
                                                : 'font-medium text-[#45464D]'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-headline text-base font-bold tracking-tight text-slate-700">Giới thiệu</h2>
                            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                {formData.bio.length}/300
                            </span>
                        </div>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={(e) => updateFormValue('bio', e.target.value.slice(0, 300))}
                            placeholder="Sinh viên năm 3, có kinh nghiệm làm việc part-time trong lĩnh vực F&B..."
                            className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-[15px] leading-relaxed outline-none transition-all focus:border-[#006399] focus:ring-4 focus:ring-[#006399]/10"
                        />
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-headline text-base font-bold tracking-tight text-slate-700">Kỹ năng</h2>
                        <div className="flex flex-wrap gap-2">
                            {skillItems.map((skill) => (
                                <div
                                    key={skill}
                                    className="flex items-center gap-1.5 rounded-full bg-[#CDE5FF] px-4 py-2 text-sm font-semibold text-[#004F7B]"
                                >
                                    <span>{skill}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="rounded-full p-0.5 transition-colors hover:bg-[#006399]/10"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={skillDraft}
                                onChange={(e) => setSkillDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSkill();
                                    }
                                }}
                                placeholder="Thêm kỹ năng mới"
                                className="h-12 flex-1 rounded-full border border-dashed border-slate-300 bg-white px-4 text-sm outline-none transition-all focus:border-[#006399] focus:ring-4 focus:ring-[#006399]/10"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-slate-300 px-4 text-sm font-semibold text-[#006399] transition-all hover:border-[#006399] hover:bg-[#006399]/5"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm
                            </button>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-headline text-base font-bold tracking-tight text-slate-700">Kinh nghiệm làm việc</h2>
                        <div className="space-y-3">
                            {experienceItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <input
                                                value={item.title}
                                                onChange={(e) => updateExperience(item.id, 'title', e.target.value)}
                                                placeholder="Vị trí công việc"
                                                className="w-full border-none bg-transparent p-0 font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                            />
                                            <input
                                                value={item.company}
                                                onChange={(e) => updateExperience(item.id, 'company', e.target.value)}
                                                placeholder="Tên công ty / cửa hàng"
                                                className="mt-1 w-full border-none bg-transparent p-0 text-sm font-medium text-[#006399] outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeExperience(item.id)}
                                            className="rounded-full p-2 text-rose-500 transition-colors hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <input
                                        value={item.period}
                                        onChange={(e) => updateExperience(item.id, 'period', e.target.value)}
                                        placeholder="06/2024 - 12/2024"
                                        className="w-full border-none bg-transparent p-0 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addExperience}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 text-sm font-semibold text-[#006399] transition-all hover:border-[#006399] hover:bg-[#006399]/5"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm kinh nghiệm
                        </button>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-headline text-base font-bold tracking-tight text-slate-700">Học vấn & Bằng cấp</h2>
                        <div className="space-y-3">
                            {formData.education.map((item, index) => (
                                <div
                                    key={`edu-${index}`}
                                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <input
                                                value={item.school}
                                                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                                placeholder="Trường / Đơn vị đào tạo"
                                                className="w-full border-none bg-transparent p-0 font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                            />
                                            <input
                                                value={item.field}
                                                onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                                placeholder="Chuyên ngành"
                                                className="w-full border-none bg-transparent p-0 text-sm font-medium text-[#006399] outline-none placeholder:text-slate-400"
                                            />
                                            <input
                                                value={item.degree}
                                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                placeholder="Bằng cấp / Chứng chỉ"
                                                className="w-full border-none bg-transparent p-0 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(index)}
                                            className="rounded-full p-2 text-rose-500 transition-colors hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <input
                                        value={item.start_date}
                                        onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                                        placeholder="Niên khóa (VD: 2020 - 2024)"
                                        className="w-full border-none bg-transparent p-0 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addEducation}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 text-sm font-semibold text-[#006399] transition-all hover:border-[#006399] hover:bg-[#006399]/5"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm học vấn
                        </button>
                    </section>

                    <section className="space-y-3 rounded-3xl bg-white p-5 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-headline text-base font-bold tracking-tight text-slate-900">CV đính kèm</h2>
                                <p className="mt-1 text-sm text-slate-500">Tải CV PDF để nhà tuyển dụng xem nhanh hồ sơ của bạn.</p>
                            </div>
                            {resumeUrl ? <Check className="h-5 w-5 text-emerald-600" /> : null}
                        </div>
                        <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-[#F2F4F6] px-4 text-sm font-semibold text-[#006399] transition-colors hover:bg-[#E6E8EA]">
                            {isUploadingResume ? 'Đang tải CV...' : resumeUrl ? 'Tải lại CV' : 'Tải CV lên'}
                            <input type="file" className="hidden" accept=".pdf" onChange={handleResumeChange} disabled={isUploadingResume} />
                        </label>
                    </section>
                </form>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl bg-white/85 shadow-[0_-20px_40px_-12px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-[420px] items-center justify-center px-5 py-5">
                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={updateProfileMutation.isPending}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#006399] text-base font-bold text-white transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
                <div className="h-4 bg-transparent" />
            </footer>
        </div>
    );
}
