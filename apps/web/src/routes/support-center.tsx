import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    MessageCircle, ChevronRight,
    Search, X, Send,
    Bot, User, Loader2, ArrowLeft, ChevronUp,
} from 'lucide-react';
import { GUIDE_CATEGORIES, getAllArticles, type GuideArticle, type GuideCategory } from '../lib/support-center-data';

export const Route = createFileRoute('/support-center')({ component: SupportCenter });

/* ── Format bot markdown → JSX ─────────────────── */
function formatBotMessage(text: string) {
    let normalized = text;
    if (!text.includes('\n') && (text.match(/\s\*\s/g) || []).length >= 2) {
        normalized = text.replace(/\s\*\s/g, '\n* ');
    }
    const lines = normalized.split('\n').filter((l) => l.trim() !== '');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1.5 my-2 pl-1">{listItems}</ul>);
            listItems = [];
        }
    };
    const renderInline = (str: string) => {
        const parts = str.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };
    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (/^[*\-]\s+/.test(trimmed)) {
            const content = trimmed.replace(/^[*\-]\s+/, '');
            listItems.push(<li key={`li-${idx}`} className="text-slate-700">{renderInline(content)}</li>);
        } else {
            flushList();
            elements.push(<p key={`p-${idx}`} className="my-1">{renderInline(trimmed)}</p>);
        }
    });
    flushList();
    return <div className="space-y-0.5">{elements}</div>;
}

/* ── Chat Message ──────────────────────────────── */
interface ChatMessage { role: 'user' | 'bot'; text: string; }

/* ── Floating Chat Panel ───────────────────────── */
const CHAT_STORAGE_KEY = 'jobnow_chat_messages';
const CHAT_SESSION_KEY = 'jobnow_chat_session';

function FloatingChat({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => {
        const saved = localStorage.getItem(CHAT_SESSION_KEY);
        if (saved) return saved;
        return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Save to localStorage whenever messages or sessionId change
    useEffect(() => {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem(CHAT_SESSION_KEY, sessionId);
    }, [sessionId]);

    useEffect(() => {
        if (!open) return;

        // Only add welcome message if no history exists
        if (messages.length === 0) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude.toFixed(2);
                        const lng = pos.coords.longitude.toFixed(2);
                        const welcomeMsg: ChatMessage = { role: 'bot', text: `Chào bạn! 👋 Tôi đã thấy bạn đang ở tọa độ (${lat}, ${lng}). Bạn muốn tìm việc gì quanh đây?` };
                        setMessages([welcomeMsg]);
                    },
                    () => {
                        const welcomeMsg: ChatMessage = { role: 'bot', text: 'Chào bạn! 👋 Tôi là Trợ lý Tìm việc GPS của JobNow. Bạn muốn tìm việc gì hôm nay?' };
                        setMessages([welcomeMsg]);
                    },
                );
            } else {
                const welcomeMsg: ChatMessage = { role: 'bot', text: 'Chào bạn! 👋 Tôi là Trợ lý Tìm việc GPS của JobNow. Bạn muốn tìm việc gì hôm nay?' };
                setMessages([welcomeMsg]);
            }
        }
    }, [open, messages.length]);

    useEffect(() => {
        if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, [messages, loading]);

    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text }]);
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5678/webhook/06609eaf-18fe-4153-bbb4-a4c8f32da184/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sendMessage', chatInput: text, sessionId }),
            });
            const data = await res.json();
            const botReply = data?.output || data?.text || data?.response || 'Xin lỗi, tôi không thể trả lời lúc này.';
            setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'bot', text: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.' }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }, [input, loading, sessionId]);

    if (!open) return null;

    return (
        <div className="fixed bottom-[88px] right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-scale-in">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-primary-500/10 overflow-hidden flex flex-col h-[520px]">
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
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
                {/* Messages */}
                <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'bot' && (
                                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot className="w-3.5 h-3.5 text-primary-600" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md'}`}>
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
                                <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Đang trả lời...</span>
                            </div>
                        </div>
                    )}
                </div>
                {/* Input */}
                <div className="border-t border-slate-100 p-3 flex-shrink-0 bg-white">
                    <div className="flex items-end gap-2">
                        <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder="Ví dụ: Tìm việc shipper tại Hà Đông..." rows={1}
                            className="flex-1 resize-none px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 border border-slate-200 focus:border-primary-300 focus:outline-none focus:bg-white transition-all"
                        />
                        <button onClick={sendMessage} disabled={loading || !input.trim()}
                            className="w-10 h-10 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Detail View ───────────────────────────────── */
function DetailView({ article, category, onBack, onSelectArticle }: {
    article: GuideArticle; category: GuideCategory;
    onBack: () => void; onSelectArticle: (a: GuideArticle, c: GuideCategory) => void;
}) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [article.id]);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-7xl py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <button onClick={onBack} className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                            Trung tâm Hỗ trợ
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-400">{category.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-600 font-medium truncate max-w-[200px]">{article.title}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-4 px-3">Chuyên mục</h3>
                            <nav className="space-y-1">
                                {GUIDE_CATEGORIES.map((cat) => {
                                    const isActive = cat.id === category.id;
                                    return (
                                        <div key={cat.id}>
                                            <button
                                                onClick={() => {
                                                    if (!isActive && cat.articles.length > 0) {
                                                        onSelectArticle(cat.articles[0], cat);
                                                    }
                                                }}
                                                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${isActive ? 'text-primary-700 bg-primary-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                <cat.icon className="w-4 h-4" />
                                                {cat.name}
                                            </button>
                                            {isActive && (
                                                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary-200 pl-3">
                                                    {cat.articles.map((a) => (
                                                        <button key={a.id} onClick={() => onSelectArticle(a, cat)}
                                                            className={`block w-full text-left text-[13px] py-2 px-2 rounded-lg transition-colors cursor-pointer ${a.id === article.id ? 'text-primary-700 font-semibold bg-primary-50/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                                                            {a.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-10">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 leading-tight">{article.title}</h1>
                                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="w-10 h-10 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer">
                                    <ChevronUp className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="guide-prose" dangerouslySetInnerHTML={{ __html: article.content }} />
                        </div>

                        {/* Mobile category nav */}
                        <div className="lg:hidden mt-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Bài viết cùng chuyên mục</h3>
                            <div className="space-y-2">
                                {category.articles.filter((a) => a.id !== article.id).map((a) => (
                                    <button key={a.id} onClick={() => onSelectArticle(a, category)}
                                        className="w-full text-left bg-white border border-slate-100 rounded-xl p-4 hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer">
                                        <span className="text-sm font-semibold text-slate-700">{a.title}</span>
                                        <p className="text-xs text-slate-400 mt-1">{a.summary}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Scroll-to-top floating button */}
            {showScrollTop && (
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-[88px] right-24 z-40 w-12 h-12 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/25 flex items-center justify-center transition-all animate-fade-in-up cursor-pointer">
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

/* ── Main Page ─────────────────────────────────── */
function SupportCenter() {
    const [searchTerm, setSearchTerm] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [view, setView] = useState<'home' | 'detail'>('home');
    const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<GuideCategory | null>(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const allArticles = getAllArticles();
    const filtered = searchTerm
        ? allArticles.filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.summary.toLowerCase().includes(searchTerm.toLowerCase()))
        : allArticles;

    const openArticle = (article: GuideArticle, category: GuideCategory) => {
        setSelectedArticle(article);
        setSelectedCategory(category);
        setView('detail');
    };

    const goHome = () => {
        setView('home');
        setSelectedArticle(null);
        setSelectedCategory(null);
        setSearchTerm('');
    };

    /* Detail view */
    if (view === 'detail' && selectedArticle && selectedCategory) {
        return (
            <>
                <DetailView article={selectedArticle} category={selectedCategory} onBack={goHome}
                    onSelectArticle={(a, c) => { setSelectedArticle(a); setSelectedCategory(c); }} />
                {/* Floating chat */}
                <FloatingChat open={chatOpen} onClose={() => setChatOpen(false)} />
                <button onClick={() => setChatOpen(!chatOpen)}
                    className={`fixed bottom-[76px] right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer ${chatOpen ? 'bg-slate-700 hover:bg-slate-600 rotate-0' : 'bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-400 hover:to-primary-600 hover:scale-110'}`}>
                    {chatOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
                    {!chatOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />}
                </button>
            </>
        );
    }

    /* Home view */
    return (
        <div className="min-h-screen">
            {/* ══════════ Hero ══════════ */}
            <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />

                <div className="relative container mx-auto px-4 max-w-7xl py-10 md:py-14">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight leading-snug">
                            Chúng tôi có thể giúp gì cho bạn?
                        </h1>
                        <div className="mt-5 max-w-lg mx-auto">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input type="text" placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl text-slate-700 placeholder:text-slate-400 shadow-lg shadow-primary-900/15 border-2 border-transparent focus:border-primary-300 focus:outline-none text-sm transition-all" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ Guide Cards ══════════ */}
            <section id="guides" className="container mx-auto px-4 max-w-7xl pb-16 pt-16">


                {searchTerm && (
                    <p className="text-sm text-slate-500 mb-6">Tìm thấy <strong className="text-primary-600">{filtered.length}</strong> kết quả cho "<strong>{searchTerm}</strong>"</p>
                )}

                {filtered.length > 0 ? (
                    searchTerm ? (
                        /* Search results — flat list */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((a) => {
                                const cat = GUIDE_CATEGORIES.find((c) => c.id === a.categoryId)!;
                                return (
                                    <button key={a.id} onClick={() => openArticle(a, cat)}
                                        className="group bg-white border border-slate-100 rounded-2xl p-6 text-left hover:border-primary-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                                <cat.icon className="w-4 h-4 text-primary-600" />
                                            </div>
                                            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{a.categoryName}</span>
                                        </div>
                                        <h3 className="font-heading font-bold text-slate-800 text-[15px] mb-2 group-hover:text-primary-700 transition-colors">{a.title}</h3>
                                        <p className="text-sm text-slate-400 line-clamp-2">{a.summary}</p>
                                        <div className="flex items-center gap-1 mt-4 text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* Category groups */
                        <div className="space-y-12">
                            {GUIDE_CATEGORIES.map((cat) => (
                                <div key={cat.id}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                            <cat.icon className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <h3 className="font-heading font-bold text-slate-800 text-xl">{cat.name}</h3>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cat.articles.length} bài viết</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {cat.articles.map((a) => (
                                            <button key={a.id} onClick={() => openArticle(a, cat)}
                                                className="group bg-white border border-slate-100 rounded-2xl p-6 text-left hover:border-primary-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                                                <h3 className="font-heading font-bold text-slate-800 text-[15px] mb-2 group-hover:text-primary-700 transition-colors">{a.title}</h3>
                                                <p className="text-sm text-slate-400 line-clamp-2">{a.summary}</p>
                                                <div className="flex items-center gap-1 mt-4 text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Không tìm thấy kết quả nào</p>
                        <p className="text-sm text-slate-400 mt-1">Thử từ khóa khác hoặc chat với AI để được hỗ trợ</p>
                    </div>
                )}
            </section>

            {/* ══════════ Floating Chatbot ══════════ */}
            <FloatingChat open={chatOpen} onClose={() => setChatOpen(false)} />
            <button onClick={() => setChatOpen(!chatOpen)}
                className={`fixed bottom-[76px] right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer ${chatOpen ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-400 hover:to-primary-600 hover:scale-110'}`}>
                {chatOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
                {!chatOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />}
            </button>
        </div>
    );
}
