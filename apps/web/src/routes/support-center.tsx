import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Headset,
    MessageCircle,
    Mail,
    Phone,
    Clock,
    ChevronDown,
    MapPin,
    FileText,
    ShieldCheck,
    CreditCard,
    UserPlus,
    HelpCircle,
    Zap,
    Search,
    X,
    Send,
    Bot,
    User,
    Loader2,
} from 'lucide-react';

export const Route = createFileRoute('/support-center')({
    component: SupportCenter,
});

/* ── FAQ Data ──────────────────────────────────── */
const FAQ_ITEMS = [
    {
        category: 'Tài khoản',
        icon: UserPlus,
        items: [
            {
                q: 'Làm sao để đăng ký tài khoản JobNow?',
                a: 'Bạn có thể đăng ký miễn phí bằng email hoặc số điện thoại. Chỉ cần nhấn nút "Đăng ký" trên trang chủ, chọn vai trò (Ứng viên hoặc Nhà tuyển dụng) và hoàn thành bước xác thực eKYC.',
            },
            {
                q: 'Tôi quên mật khẩu, phải làm sao?',
                a: 'Nhấn vào "Quên mật khẩu" ở trang đăng nhập, nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu về email của bạn trong vòng 2 phút.',
            },
        ],
    },
    {
        category: 'Tìm việc',
        icon: MapPin,
        items: [
            {
                q: 'GPS tìm việc hoạt động như thế nào?',
                a: 'JobNow sử dụng vị trí GPS của bạn để hiển thị các công việc thời vụ gần nhất. Cho phép truy cập vị trí khi được hỏi để nhận kết quả chính xác nhất. Bạn có thể lọc theo bán kính 1-10km.',
            },
            {
                q: 'Tôi có thể ứng tuyển bao nhiêu công việc cùng lúc?',
                a: 'Bạn có thể ứng tuyển không giới hạn công việc. Tuy nhiên, hãy đảm bảo bạn chỉ nhận ca làm khi thực sự có thể tham gia để giữ điểm uy tín cao.',
            },
        ],
    },
    {
        category: 'Thanh toán',
        icon: CreditCard,
        items: [
            {
                q: 'Khi nào tôi nhận được tiền sau khi hoàn thành ca làm?',
                a: 'Tiền sẽ được thanh toán trong vòng 24h sau khi nhà tuyển dụng xác nhận bạn đã hoàn thành ca làm. Bạn có thể rút tiền về tài khoản ngân hàng hoặc ví điện tử.',
            },
            {
                q: 'Phí sử dụng JobNow là bao nhiêu?',
                a: 'Ứng viên sử dụng hoàn toàn miễn phí. Nhà tuyển dụng trả phí dịch vụ nhỏ cho mỗi tin tuyển dụng được đăng.',
            },
        ],
    },
    {
        category: 'Bảo mật & Uy tín',
        icon: ShieldCheck,
        items: [
            {
                q: 'Điểm uy tín hoạt động như thế nào?',
                a: 'Mỗi người dùng bắt đầu với điểm uy tín cơ bản. Hoàn thành ca làm đúng hẹn, nhận đánh giá tốt sẽ tăng điểm. Hủy ca, không đến sẽ bị trừ điểm. Điểm uy tín cao giúp bạn được ưu tiên nhận việc.',
            },
            {
                q: 'Dữ liệu vị trí của tôi có an toàn không?',
                a: 'Hoàn toàn an toàn. JobNow chỉ sử dụng vị trí GPS để tìm kiếm việc làm gần bạn, không lưu trữ hay chia sẻ với bên thứ ba. Bạn có thể tắt GPS bất cứ lúc nào.',
            },
        ],
    },
];

/* ── Accordion Item ────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className={`border border-slate-200/80 rounded-2xl transition-all duration-300 ${open ? 'bg-white shadow-lg shadow-primary-500/5 border-primary-200/60' : 'bg-white/60 hover:bg-white hover:shadow-sm'}`}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
            >
                <span
                    className={`text-[15px] font-semibold transition-colors ${open ? 'text-primary-700' : 'text-slate-700'}`}
                >
                    {q}
                </span>
                <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300 ${open ? 'rotate-180 text-primary-500' : 'text-slate-400'}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">
                    {a}
                </p>
            </div>
        </div>
    );
}

/* ── Format bot markdown to JSX ────────────────── */
function formatBotMessage(text: string) {
    // Normalize: if bullets are inline (e.g. "text: * item1 * item2"), split them
    // This handles API responses where list items aren't separated by newlines
    let normalized = text;

    // Pattern: " * **item**" appearing multiple times inline → split into lines
    if (!text.includes('\n') && (text.match(/\s\*\s/g) || []).length >= 2) {
        normalized = text.replace(/\s\*\s/g, '\n* ');
    }

    // Split by newlines to handle line-by-line
    const lines = normalized.split('\n').filter((l) => l.trim() !== '');

    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1.5 my-2 pl-1">
                    {listItems}
                </ul>
            );
            listItems = [];
        }
    };

    const renderInline = (str: string) => {
        // Convert **bold** to <strong>
        const parts = str.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-semibold text-slate-900">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Bullet list items: lines starting with "* " or "- "
        if (/^[\*\-]\s+/.test(trimmed)) {
            const content = trimmed.replace(/^[\*\-]\s+/, '');
            listItems.push(
                <li key={`li-${idx}`} className="text-slate-700">
                    {renderInline(content)}
                </li>
            );
        } else {
            flushList();
            elements.push(
                <p key={`p-${idx}`} className="my-1">
                    {renderInline(trimmed)}
                </p>
            );
        }
    });

    flushList();
    return <div className="space-y-0.5">{elements}</div>;
}

/* ── Chat Message type ─────────────────────────── */
interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
}

/* ── Inline Chat Panel ─────────────────────────── */
function ChatPanel({ onClose }: { onClose: () => void }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Generate session ID once
    useEffect(() => {
        setSessionId(crypto.randomUUID());
        // Get location and send welcome
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude.toFixed(2);
                    const lng = pos.coords.longitude.toFixed(2);
                    setMessages([{
                        role: 'bot',
                        text: `Chào bạn! 👋 Tôi đã thấy bạn đang ở tọa độ (${lat}, ${lng}). Bạn muốn tìm việc gì quanh đây?`,
                    }]);
                },
                () => {
                    setMessages([{
                        role: 'bot',
                        text: 'Chào bạn! 👋 Tôi là Trợ lý Tìm việc GPS của JobNow. Bạn muốn tìm việc gì hôm nay?',
                    }]);
                }
            );
        } else {
            setMessages([{
                role: 'bot',
                text: 'Chào bạn! 👋 Tôi là Trợ lý Tìm việc GPS của JobNow. Bạn muốn tìm việc gì hôm nay?',
            }]);
        }
    }, []);

    // Auto-scroll to bottom (only within the chat container, not the whole page)
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, loading]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await fetch(
                'https://viethoa127.app.n8n.cloud/webhook/24d70728-77d3-43e5-8e7a-2447085b1774/chat',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'sendMessage',
                        chatInput: text,
                        sessionId,
                    }),
                }
            );
            const data = await res.json();
            const botReply = data?.output || data?.text || data?.response || 'Xin lỗi, tôi không thể trả lời lúc này.';
            setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.' },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }, [input, loading, sessionId]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-primary-500/10 overflow-hidden flex flex-col h-[520px] animate-fade-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Trợ lý Tìm việc GPS</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-primary-100 text-xs">Đang hoạt động</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'bot' && (
                            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Bot className="w-3.5 h-3.5 text-primary-600" />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md'
                                }`}
                        >
                            {msg.role === 'bot' ? formatBotMessage(msg.text) : msg.text}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <User className="w-3.5 h-3.5 text-slate-600" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2.5 justify-start">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <div className="bg-white text-slate-400 border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Đang trả lời...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 p-3 flex-shrink-0 bg-white">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Ví dụ: Tìm việc shipper tại Hà Đông..."
                        rows={1}
                        className="flex-1 resize-none px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 border border-slate-200 focus:border-primary-300 focus:outline-none focus:bg-white transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="w-10 h-10 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ─────────────────────────────────── */
function SupportCenter() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const chatSectionRef = useRef<HTMLDivElement>(null);

    // No page scroll — chat panel stays in place

    /* ── Filter logic ─────────────────────────────── */
    const filteredFaq = FAQ_ITEMS.map((cat) => ({
        ...cat,
        items: cat.items.filter(
            (item) =>
                (!activeCategory || cat.category === activeCategory) &&
                (!searchTerm ||
                    item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.a.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
    })).filter((cat) => cat.items.length > 0);

    return (
        <div className="min-h-screen">
            {/* ══════════ Hero Section ══════════ */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative container mx-auto px-4 max-w-7xl py-20 md:py-28">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6 animate-fade-in-up">
                            <Headset className="w-4 h-4" />
                            Hỗ trợ 24/7 bởi AI & đội ngũ chuyên viên
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-tight animate-fade-in-up delay-100">
                            Trung tâm
                            <span className="block text-accent-100">Hỗ trợ</span>
                        </h1>
                        <p className="text-lg md:text-xl text-primary-100 mt-5 max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                            Tìm câu trả lời nhanh chóng hoặc chat trực tiếp với trợ lý AI thông minh của chúng tôi
                        </p>

                        <div className="mt-8 max-w-lg mx-auto animate-fade-in-up delay-300">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm câu hỏi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-slate-700 placeholder:text-slate-400 shadow-xl shadow-primary-900/20 border-2 border-transparent focus:border-primary-300 focus:outline-none text-[15px] transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none">
                        <path d="M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 28C672 36 768 48 864 50C960 52 1056 44 1152 36C1248 28 1344 20 1392 16L1440 12V60H0Z" fill="#f8fafc" />
                    </svg>
                </div>
            </section>

            {/* ══════════ Quick Action Cards ══════════ */}
            <section className="container mx-auto px-4 max-w-7xl -mt-2 pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        {
                            icon: MessageCircle,
                            title: 'Chat với AI',
                            desc: 'Nhận trả lời tức thì từ trợ lý AI',
                            color: 'primary',
                            action: () => setChatOpen(!chatOpen),
                        },
                        {
                            icon: Mail,
                            title: 'Gửi Email',
                            desc: 'support@jobnow.vn',
                            color: 'emerald',
                            action: () => window.open('mailto:support@jobnow.vn', '_blank'),
                        },
                        {
                            icon: FileText,
                            title: 'Hướng dẫn',
                            desc: 'Đọc tài liệu sử dụng chi tiết',
                            color: 'amber',
                            action: () => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' }),
                        },
                    ].map(({ icon: Icon, title, desc, color, action }) => (
                        <button
                            key={title}
                            onClick={action}
                            className={`group relative overflow-hidden p-6 rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 text-left cursor-pointer hover:-translate-y-1 ${title === 'Chat với AI' && chatOpen
                                ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-500/20'
                                : 'bg-white border-slate-100'
                                }`}
                        >
                            <div
                                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color === 'primary'
                                    ? 'bg-gradient-to-br from-primary-50 to-transparent'
                                    : color === 'emerald'
                                        ? 'bg-gradient-to-br from-emerald-50 to-transparent'
                                        : 'bg-gradient-to-br from-amber-50 to-transparent'
                                    }`}
                            />
                            <div className="relative">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color === 'primary'
                                        ? 'bg-primary-100 text-primary-600'
                                        : color === 'emerald'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-amber-100 text-amber-600'
                                        }`}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-heading font-bold text-slate-900 text-lg">{title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ══════════ Inline Chat Section ══════════ */}
            {chatOpen && (
                <section ref={chatSectionRef} className="container mx-auto px-4 max-w-3xl pb-12">
                    <ChatPanel onClose={() => setChatOpen(false)} />
                </section>
            )}

            {/* ══════════ FAQ Section ══════════ */}
            <section id="faq-section" className="container mx-auto px-4 max-w-7xl pb-16">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                        <HelpCircle className="w-4 h-4" />
                        FAQ
                    </div>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
                        Câu hỏi thường gặp
                    </h2>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                        Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${!activeCategory
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-200 hover:text-primary-600'
                            }`}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Tất cả
                    </button>
                    {FAQ_ITEMS.map(({ category, icon: CatIcon }) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${activeCategory === category
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-200 hover:text-primary-600'
                                }`}
                        >
                            <CatIcon className="w-3.5 h-3.5" />
                            {category}
                        </button>
                    ))}
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                    {filteredFaq.length > 0 ? (
                        filteredFaq.map(({ category, icon: CatIcon, items }) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                        <CatIcon className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <h3 className="font-heading font-bold text-slate-800">{category}</h3>
                                </div>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <FaqItem key={item.q} q={item.q} a={item.a} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Không tìm thấy kết quả nào</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Thử từ khóa khác hoặc chat trực tiếp với AI để được hỗ trợ
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════ Contact Section ══════════ */}
            <section className="bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-7xl py-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-heading font-bold text-slate-900">Vẫn cần hỗ trợ?</h2>
                        <p className="text-slate-500 mt-2">Liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: Phone, title: 'Hotline', info: '1900 xxxx', sub: 'Miễn phí cuộc gọi', gradient: 'from-primary-500 to-primary-600' },
                            { icon: Mail, title: 'Email', info: 'support@jobnow.vn', sub: 'Phản hồi trong 2h', gradient: 'from-emerald-500 to-emerald-600' },
                            { icon: Clock, title: 'Giờ làm việc', info: '08:00 – 22:00', sub: 'Thứ 2 – Chủ nhật', gradient: 'from-amber-500 to-orange-500' },
                        ].map(({ icon: Icon, title, info, sub, gradient }) => (
                            <div
                                key={title}
                                className="group relative bg-slate-50 rounded-2xl p-6 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-slate-100"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-heading font-bold text-slate-900 text-lg">{title}</h3>
                                <p className="text-primary-600 font-semibold mt-1">{info}</p>
                                <p className="text-sm text-slate-400 mt-0.5">{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
