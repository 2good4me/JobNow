import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Verified, 
  Star, 
  ChevronRight, 
  MapPin, 
  Phone, 
  UserPlus, 
  MessageSquare
} from 'lucide-react';

export const Route = createFileRoute('/candidate/employers/$employerId')({
  component: EmployerProfileComponent,
});

function EmployerProfileComponent() {
  // Mock data based on your Stitch design
  const employer = {
    name: "The Coffee House",
    category: "F&B / Nhà hàng",
    isVerified: true,
    rating: 4.5,
    reviewCount: 24,
    stats: {
      activeJobs: 12,
      hiredCount: 156,
      reputationScore: 4.5
    },
    about: "Hành trình của chúng mình là truyền cảm hứng về một phong cách sống hiện đại, mang đến sự kết nối thân tình qua những tách cà phê thơm ngon, chất lượng.",
    address: "123 Trần Hưng Đạo, Quận 1, TP. HCM",
    phone: "091x.xxx.x89",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMZITj6fMBtlO9AeB0qR6DuW67NyIWgZe7ORjaMC6nb7wISvz4Prg7c6ay32mjloLT4Ivjne3FtgTTGUFiH5lt4npMIU51BpTCRVHNipygql4sNaHzG8_NXByZHtkyr8ssYttMF80Mx39618A4Ddc2hfg9xtdjCFlNEjXZLpQH2wcm710_aacDW_4nseknlPC1zIlgigtVMkq8OhVBGHYvLtGXVO2KJMD3ha_6AF4b_JSQDyyhR87WvhBYSrt9aJBOmi7WyetheuM"
  };

  const activeJobs = [
    { id: 1, title: "Phục vụ Part-time", salary: "150.000đ/h", type: "Part-time" },
    { id: 2, title: "Pha chế (Barista)", salary: "8.500.000đ/tháng", type: "Full-time" },
  ];

  const reviews = [
    {
      id: 1,
      user: "Minh Anh",
      rating: 5,
      date: "Hôm qua",
      comment: "Môi trường làm việc rất chuyên nghiệp và thân thiện. Quy trình đào tạo bài bản cho nhân viên mới.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKJFXYcyoC5Z8O3_gLcuNa0Izf0CbS06x_WQoGK0EH0DoB0QjRJtTSl0-beiJmGCDRDkqENcAl8EbDWqmueyBFHygy2ew1FvGw9-F9z4DLVK4muWVQPPFe-AbPUWHVDh3Y2CT6_bl8yU6RZ31iXOWwqDi5pgEirFlZ4B6560c7Enl8CxlmF1Im6TNLXYX_JT5Ch7g_C9hygk6mvnRM9hKgGIwmKgGNAycem-7qiur_nfDCQthJTEdhFeAunZL8b5rynSlga5unY1k"
    },
    {
      id: 2,
      user: "Hoàng Nam",
      rating: 4.5,
      date: "12/10/2023",
      comment: "Lịch làm việc linh hoạt, phù hợp cho sinh viên. Quản lý cửa hàng rất tâm lý.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfxs_FnLgCQha2doxxowovgwzMwEaSzAdCnuTnz7JycoGiCCt9m4VYLpRVFSewTgdhrIVfCHdHLQNlZwFJkdTI0TmHz5gKo8YrBf0aY2oSBnFgjqzHu2vsgH-cxgsah3f3g4kiw0ZeTnu3MbtvhhBpiZs8Ol_szxX-b3jo9QPhUOhXApiofTe5_W35-96Q2RO_v0CgdTfMMCnM9ggvBnokezkt1fZAH1e1PEztQPi8f0r-PrbIngk1yrysuGlzBIoC3SKJ1ySoZAM"
    }
  ];

  return (
    <div className="bg-[#f7f9fb] min-h-screen font-sans text-[#191c1e] antialiased">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center px-4 h-16 max-w-[375px] mx-auto">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <h1 className="ml-2 font-bold text-lg tracking-tight text-slate-900">
            Hồ sơ nhà tuyển dụng
          </h1>
        </div>
      </header>

      <main className="pt-20 pb-32 px-4 max-w-[375px] mx-auto">
        {/* Profile Section */}
        <section className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-slate-100">
              <img 
                src={employer.avatar} 
                alt={employer.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl text-[#191c1e] truncate">{employer.name}</h2>
              {employer.isVerified && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Verified size={18} className="text-[#009668] fill-[#009668]/10" />
                  <span className="text-[#009668] text-[10px] font-bold tracking-wider uppercase">ĐÃ XÁC THỰC</span>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#45464d] text-[10px] font-bold uppercase tracking-tight rounded-lg">
                  {employer.category}
                </span>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all text-left">
            <div className="flex text-yellow-500">
              <Star size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-[#191c1e]">{employer.rating}</span>
            <span className="text-[#45464d] text-sm">({employer.reviewCount} đánh giá)</span>
            <ChevronRight size={20} className="ml-auto text-[#c6c6cd]" />
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Tin đang tuyển", value: employer.stats.activeJobs },
            { label: "Người đã thuê", value: employer.stats.hiredCount },
            { label: "Chỉ số uy tín", value: employer.stats.reputationScore },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl text-center shadow-sm border border-slate-50">
              <p className="font-bold text-xl text-[#006399]">{stat.value}</p>
              <p className="text-[9px] font-bold text-[#45464d] uppercase mt-1 leading-tight">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* About Section */}
        <section className="mb-10">
          <h3 className="font-bold text-lg mb-4">Giới thiệu</h3>
          <div className="bg-[#f2f4f6] rounded-3xl p-6">
            <p className="text-[#45464d] text-sm leading-relaxed mb-6">
              {employer.about}
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#006399] mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-[#191c1e]">Cơ sở chính</p>
                  <p className="text-[#45464d]">{employer.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#006399] mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-[#191c1e]">Điện thoại</p>
                  <p className="text-[#45464d]">{employer.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Jobs */}
        <section className="mb-10 -mx-4 overflow-hidden">
          <div className="px-4 flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Đang tuyển</h3>
            <Link to="/candidate/jobs" className="text-[#006399] text-sm font-semibold">Xem tất cả</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
            {activeJobs.map((job) => (
              <div key={job.id} className="min-w-[200px] bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <span className="text-[10px] font-bold text-[#005236] bg-[#6ffbbe]/30 px-2 py-0.5 rounded-full uppercase mb-3 inline-block">
                  {job.type}
                </span>
                <h4 className="font-bold text-[#191c1e] leading-snug mb-2">{job.title}</h4>
                <p className="text-[#006399] font-extrabold">{job.salary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-10">
          <h3 className="font-bold text-lg mb-4">Đánh giá từ ứng viên</h3>
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div key={review.id} className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 ${idx === 1 ? 'opacity-70' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
                    <img src={review.avatar} alt={review.user} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#191c1e]">{review.user}</p>
                    <div className="flex items-center text-yellow-500 scale-75 origin-left">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.floor(review.rating) ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-[11px] text-[#45464d] font-medium">{review.date}</span>
                </div>
                <p className="text-[#45464d] text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-8 z-50">
        <div className="flex gap-3 max-w-[375px] mx-auto">
          <button className="flex-1 h-[48px] flex items-center justify-center gap-2 border border-[#006399] text-[#006399] rounded-xl font-semibold text-sm hover:bg-sky-50 transition-colors active:scale-95">
            <UserPlus size={20} />
            Theo dõi
          </button>
          <button className="flex-1 h-[48px] flex items-center justify-center gap-2 bg-[#006399] text-white rounded-xl font-semibold text-sm hover:bg-[#004b74] transition-colors active:scale-95 shadow-sm">
            <MessageSquare size={20} />
            Nhắn tin
          </button>
        </div>
      </nav>
    </div>
  );
}
