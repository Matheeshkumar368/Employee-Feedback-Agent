"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, LayoutDashboard, Users, MessageSquare, Building2,
  FileBarChart, BarChart3, Sparkles, Settings, Brain,
  Send, Copy, Trash2, Plus, Check, ChevronDown, X,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { cn, formatDateTime } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/admin/dashboard",   icon: LayoutDashboard },
  { label: "Employees",   href: "/admin/employees",   icon: Users },
  { label: "Feedback",    href: "/admin/feedback",    icon: MessageSquare },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Reports",     href: "/admin/reports",     icon: FileBarChart },
  { label: "Analytics",   href: "/admin/analytics",   icon: BarChart3 },
  { label: "AI Insights", href: "/admin/ai-insights", icon: Sparkles },
  { label: "AI Chat",     href: "/admin/ai-chat",     icon: Brain },
  { label: "Settings",    href: "/admin/settings",    icon: Settings },
];

const SUGGESTED_PROMPTS = [
  "What are the most common employee complaints?",
  "Which department has the lowest satisfaction score?",
  "Summarize this month's feedback trends.",
  "Which employees submitted negative feedback recently?",
  "What HR actions should I prioritize?",
  "Generate an executive summary report.",
  "What is the average employee satisfaction rating?",
  "Identify employees at risk of leaving.",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  title: string;
  updatedAt: string;
}

// ── Typing animation ───────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

// ── Markdown message renderer ──────────────────────────────────────────────────
function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="prose-dark text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 text-white/75 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="my-2 space-y-1 pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 pl-4 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="text-white/65 leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-base font-bold text-white mt-3 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-3 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-white/90 mt-2 mb-1">{children}</h3>,
          code: ({ children, className }) => {
            const inline = !className;
            return inline
              ? <code className="text-violet-300 bg-violet-500/15 border border-violet-500/20 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
              : <code className="block bg-black/30 border border-white/10 rounded-lg p-3 text-xs font-mono text-white/70 overflow-x-auto whitespace-pre my-2">{children}</code>;
          },
          blockquote: ({ children }) => <blockquote className="border-l-2 border-violet-500/50 pl-3 italic text-white/55 my-2">{children}</blockquote>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">{children}</a>,
        }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminAIChatPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [sessions, setSessions]       = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [copiedId, setCopiedId]       = useState<number | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, sending, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/admin");
    if (!isLoading && user && user.role !== "admin") router.push("/employee/dashboard");
  }, [user, isLoading, router]);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { headers: { Authorization: `Bearer ${token ?? ""}` } });
      const d = await res.json() as { sessions?: ChatSession[] };
      setSessions(d.sessions ?? []);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { if (user) void loadSessions(); }, [user, loadSessions]);

  const loadSession = async (sid: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${sid}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const d = await res.json() as { session?: { messages: { role: "user"|"assistant"; content: string; timestamp: string }[] } };
      if (d.session) {
        setMessages(d.session.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        setSessionId(sid);
        setShowSessions(false);
      }
    } catch { /* silent */ }
  };

  const deleteSession = async (sid: string) => {
    await fetch(`/api/chat?sessionId=${sid}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    void loadSessions();
    if (sessionId === sid) { setMessages([]); setSessionId(null); }
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ message: content, sessionId }),
      });
      const d = await res.json() as { message?: string; sessionId?: string; error?: string };
      if (!res.ok) throw new Error(d.error ?? "Request failed");

      const assistantMsg: ChatMessage = { role: "assistant", content: d.message ?? "", timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
      if (d.sessionId && !sessionId) { setSessionId(d.sessionId); void loadSessions(); }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1)); // remove optimistic message
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const copyMessage = async (content: string, idx: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => { setMessages([]); setSessionId(null); setError(null); };

  const newChat = () => { clearChat(); setShowSessions(false); };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">

        {/* ── Chat header ── */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">AuraHR AI Agent</h1>
              <p className="text-[10px] text-white/35">Senior HR Consultant · Powered by Gemini</p>
            </div>
            <div className="flex items-center gap-1 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Session history */}
            <div className="relative">
              <button onClick={() => setShowSessions((s) => !s)}
                className={cn("flex items-center gap-1.5 rounded-xl border px-3 h-8 text-xs transition-all",
                  showSessions ? "border-violet-500/40 bg-violet-500/10 text-violet-400" : "border-white/10 bg-white/[0.04] text-white/40 hover:text-white")}>
                History
                <ChevronDown className={cn("w-3 h-3 transition-transform", showSessions && "rotate-180")} />
              </button>
              <AnimatePresence>
                {showSessions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSessions(false)} />
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-72 z-50 rounded-2xl border border-white/10 bg-[#0f0f1e]/98 backdrop-blur-xl shadow-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <span className="text-xs font-semibold text-white">Chat History</span>
                        <button onClick={newChat}
                          className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors">
                          <Plus className="w-3 h-3" /> New Chat
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {sessions.length === 0 ? (
                          <p className="text-xs text-white/30 text-center py-6">No chat history</p>
                        ) : sessions.map((s) => (
                          <div key={s.sessionId}
                            className={cn("flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.04] cursor-pointer transition-colors group",
                              sessionId === s.sessionId && "bg-violet-500/10")}>
                            <div className="flex-1 min-w-0" onClick={() => void loadSession(s.sessionId)}>
                              <p className="text-xs font-medium text-white/70 truncate">{s.title}</p>
                              <p className="text-[10px] text-white/25 mt-0.5">{formatDateTime(s.updatedAt)}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); void deleteSession(s.sessionId); }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400/50 hover:text-red-400 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <button onClick={newChat}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 h-8 text-xs text-white/40 hover:text-white transition-all">
              <Plus className="w-3 h-3" /> New
            </button>
            {messages.length > 0 && (
              <button onClick={clearChat} className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/30 hover:text-red-400 hover:border-red-500/20 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.07] bg-[#0d0d1f] flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-5 shadow-xl shadow-violet-500/25">
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-lg font-bold text-white mb-2">AuraHR AI Agent</h2>
              <p className="text-white/40 text-sm max-w-sm mb-8">
                I have access to your company's feedback database. Ask me anything about employee sentiment, department trends, or HR recommendations.
              </p>
              {/* Suggested prompts */}
              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTED_PROMPTS.slice(0, 6).map((prompt) => (
                  <motion.button key={prompt} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => void sendMessage(prompt)}
                    className="text-left text-xs text-white/55 border border-white/[0.07] bg-white/[0.02] hover:bg-violet-500/5 hover:border-violet-500/20 hover:text-white/75 px-3 py-2.5 rounded-xl transition-all leading-relaxed">
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  {/* Avatar */}
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                      : "bg-gradient-to-br from-violet-500 to-purple-600 text-white")}>
                    {msg.role === "user" ? user.name.charAt(0) : <Brain className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={cn("group max-w-[82%] relative", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn("rounded-2xl px-4 py-3",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-600/40 to-indigo-600/40 border border-blue-500/20 rounded-tr-sm"
                        : "bg-white/[0.04] border border-white/[0.07] rounded-tl-sm")}>
                      {msg.role === "assistant"
                        ? <MarkdownMessage content={msg.content} />
                        : <p className="text-sm text-white/85 leading-relaxed">{msg.content}</p>}
                    </div>
                    {/* Timestamp + copy */}
                    <div className={cn("flex items-center gap-2 mt-1 px-1", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                      <span className="text-[10px] text-white/20">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {msg.role === "assistant" && (
                        <button onClick={() => void copyMessage(msg.content, idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-white/60">
                          {copiedId === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {sending && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mx-5 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>

        {/* ── Input area ── */}
        <div className="mt-3 flex-shrink-0">
          {/* Suggested prompts row (when chat is active) */}
          {messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                <button key={prompt} onClick={() => void sendMessage(prompt)} disabled={sending}
                  className="flex-shrink-0 text-[11px] text-white/40 border border-white/[0.07] bg-white/[0.02] hover:bg-violet-500/5 hover:border-violet-500/20 hover:text-white/60 px-3 py-1.5 rounded-xl transition-all disabled:opacity-40">
                  {prompt.slice(0, 40)}…
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea ref={inputRef} rows={1} value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
                onKeyDown={handleKeyDown} disabled={sending} placeholder="Ask about feedback trends, employee sentiment, HR recommendations…"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-none backdrop-blur-sm transition-all leading-relaxed disabled:opacity-50"
                style={{ minHeight: "48px", maxHeight: "120px" }} />
              <button onClick={() => void sendMessage()} disabled={!input.trim() || sending}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/15 mt-2">
            Press Enter to send · Shift+Enter for new line · AuraHR uses feedback data from MongoDB
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
