import { useEffect, useRef, useState, useCallback } from 'react';
import { Hash, Send, Loader2 } from 'lucide-react';
import { getJson, postJson } from '../lib/api';
import { loadDepartments } from '../lib/domainApi';
import type { Department } from '../lib/domainApi';

type ChatMessage = {
  chatId: string;
  message: string;
  channelType: string;
  departmentId: string | null;
  createdAt: string;
  sender: { recruiterId: string; name: string; email: string } | null;
};

type Channel =
  | { type: 'GENERAL'; id: 'general'; name: string }
  | { type: 'DEPARTMENT'; id: string; name: string };

const AVATAR_COLORS = [
  '#5B5FC7', '#3A7BD5', '#00B09B', '#E67E22', '#E74C3C',
  '#9B59B6', '#1ABC9C', '#2980B9', '#D35400', '#C0392B',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function TeamChat() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build channel list from departments
  useEffect(() => {
    loadDepartments().then((deps) => {
      setDepartments(deps);
      const list: Channel[] = [
        { type: 'GENERAL', id: 'general', name: 'Général' },
        ...deps.map((d) => ({ type: 'DEPARTMENT' as const, id: d.departmentId, name: d.name })),
      ];
      setChannels(list);
      if (!activeChannel) setActiveChannel(list[0]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessages = useCallback(async (ch: Channel) => {
    try {
      const url =
        ch.type === 'GENERAL'
          ? '/api/team-chat/general'
          : `/api/team-chat/department/${ch.id}`;
      const data = await getJson<ChatMessage[]>(url);
      setMessages(data || []);
    } catch { /* ignore polling errors */ }
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) return;
    setLoading(true);
    fetchMessages(activeChannel).finally(() => setLoading(false));

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      void fetchMessages(activeChannel);
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChannel, fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeChannel || sending) return;
    setSending(true);
    try {
      const url =
        activeChannel.type === 'GENERAL'
          ? '/api/team-chat/general'
          : `/api/team-chat/department/${activeChannel.id}`;
      const msg = await postJson<ChatMessage>(url, { message: input.trim() });
      setMessages((prev) => [...prev, msg]);
      setInput('');
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  }

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(msg);
    else grouped.push({ date: d, msgs: [msg] });
  }

  return (
    <div className="flex h-full bg-t-bg1" style={{ minHeight: 0 }}>
      {/* Sidebar: channels */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-t-stroke2 bg-t-bg2">
        <div className="px-4 py-3 border-b border-t-stroke3">
          <h2 className="text-caption1 font-semibold text-t-fg3 tracking-wide uppercase">
            Canaux
          </h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {channels.map((ch) => {
            const active = activeChannel?.id === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md mx-1 text-left transition-colors duration-100 ${
                  active
                    ? 'bg-t-bg-subtle-selected text-t-fg-brand'
                    : 'text-t-fg3 hover:bg-t-bg-subtle-hover hover:text-t-fg1'
                }`}
                style={{ width: 'calc(100% - 8px)' }}
              >
                <Hash
                  className={`w-4 h-4 shrink-0 ${active ? 'text-t-fg-brand' : 'text-t-fg4'}`}
                  strokeWidth={2}
                />
                <span className="text-sm truncate">{ch.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <header className="h-12 flex items-center gap-2 px-4 border-b border-t-stroke2 bg-t-bg1 shrink-0">
          <Hash className="w-4 h-4 text-t-fg-brand" strokeWidth={2} />
          <span className="text-sm font-semibold text-t-fg1">{activeChannel?.name ?? ''}</span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ minHeight: 0 }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 text-t-fg-brand animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-t-fg4">Aucun message. Soyez le premier !</p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-t-stroke3" />
                  <span className="text-[11px] text-t-fg4 font-medium shrink-0">{group.date}</span>
                  <div className="flex-1 h-px bg-t-stroke3" />
                </div>
                {group.msgs.map((msg) => {
                  const name = msg.sender?.name || msg.sender?.email || 'Inconnu';
                  const color = avatarColor(name);
                  return (
                    <div key={msg.chatId} className="flex items-start gap-3 py-1 group hover:bg-t-bg-subtle-hover rounded-md px-2 -mx-2">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-semibold mt-0.5"
                        style={{ background: color }}
                      >
                        {initials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-t-fg1">{name}</span>
                          <span className="text-[11px] text-t-fg4">{formatTime(msg.createdAt)}</span>
                        </div>
                        <p className="text-sm text-t-fg2 break-words leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="shrink-0 px-4 pb-4 pt-2">
          <div className="flex items-center gap-2 bg-t-bg2 border border-t-stroke2 rounded-xl px-4 py-2 focus-within:border-t-stroke-brand transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message #${activeChannel?.name ?? '...'}`}
              className="flex-1 bg-transparent text-sm text-t-fg1 placeholder:text-t-fg4 outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40"
              style={{ background: input.trim() ? '#5B5FC7' : 'transparent' }}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className={`w-4 h-4 ${input.trim() ? 'text-white' : 'text-t-fg4'}`} strokeWidth={2} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
