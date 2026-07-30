import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, MessageSquareText, Search, ArrowLeft } from "lucide-react";
// Send juga dipakai untuk menandai kartu pesan sistem "Permintaan".
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import Spinner from "../components/Spinner";
import Avatar from "../components/Avatar";

const jam = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";

// Normalisasi baris realtime (snake_case) ke bentuk API (camelCase).
const norm = (r) => ({
  id: r.id,
  conversationId: r.conversation_id ?? r.conversationId,
  senderProfileId: r.sender_profile_id ?? r.senderProfileId,
  type: r.type,
  body: r.body,
  payload: r.payload,
  createdAt: r.created_at ?? r.createdAt,
});

const quickReplies = [
  "Siap, saya di lokasi",
  "15 menit lagi sampai",
  "Bisa besok pagi",
  "Ada yang ingin ditanyakan?",
];

const ChatInbox = () => {
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api
      .get("/chat/conversations")
      .then((r) => {
        setConvos(r.data.data);
        if (r.data.data[0]) setActiveId(r.data.data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setThread(null);
    api.get(`/chat/conversations/${activeId}/messages`).then((r) => setThread(r.data.data));

    const channel = supabase
      .channel(`msg-${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          const m = norm(payload.new);
          setThread((t) =>
            t && t.conversation.id === activeId && !t.messages.find((x) => x.id === m.id)
              ? { ...t, messages: [...t.messages, m] }
              : t,
          );
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread?.messages?.length]);

  const send = async (bodyText) => {
    const body = (bodyText ?? text).trim();
    if (!body || !activeId) return;
    setText("");
    setSending(true);
    try {
      const { data } = await api.post(`/chat/conversations/${activeId}/messages`, {
        type: "text",
        body,
      });
      const m = data.data.message;
      setThread((t) =>
        t && !t.messages.find((x) => x.id === m.id) ? { ...t, messages: [...t.messages, m] } : t,
      );
    } catch {
      toast.error("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-moss">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const active = convos.find((c) => c.id === activeId);
  const other = thread?.conversation?.other;
  const meId = thread?.conversation?.meId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-[340px_1fr]">
        {/* Daftar percakapan */}
        <aside className={`flex flex-col border-r border-line ${activeId ? "hidden lg:flex" : "flex"}`}>
          <div className="border-b border-line p-4">
            <h1 className="text-lg font-extrabold text-ink">Pesan</h1>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-paper px-3">
              <Search className="h-4 w-4 text-moss" aria-hidden="true" />
              <input
                placeholder="Cari percakapan..."
                className="h-9 w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convos.length === 0 ? (
              <div className="grid place-items-center py-16 text-center text-sm text-moss">
                Belum ada percakapan.
              </div>
            ) : (
              convos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors ${
                    c.id === activeId ? "bg-limesoft/40" : "hover:bg-cloud"
                  }`}
                >
                  <Avatar
                    src={c.avatarUrl}
                    name={c.name}
                    className="h-11 w-11 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold text-ink">{c.name}</p>
                      <span className="shrink-0 text-xs text-moss">{jam(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-sm text-moss">{c.lastMessage || "Mulai percakapan"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Ruang chat */}
        <section className={`flex flex-col ${activeId ? "flex" : "hidden lg:flex"}`}>
          {!active ? (
            <div className="grid flex-1 place-items-center text-center text-moss">
              <div>
                <MessageSquareText className="mx-auto h-10 w-10" aria-hidden="true" />
                <p className="mt-2 text-sm">Pilih percakapan untuk mulai chat.</p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-line px-4 py-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="rounded-lg p-1.5 text-moss hover:bg-cloud lg:hidden"
                  aria-label="Kembali"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <Avatar
                  src={other?.avatarUrl || active.avatarUrl}
                  name={other?.name || active.name}
                  className="h-10 w-10"
                />
                <div>
                  <p className="font-bold text-ink">{other?.name || active.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-forest">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                    Online
                  </p>
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4">
                {!thread ? (
                  <div className="grid place-items-center py-10">
                    <Spinner className="h-6 w-6 text-forest" />
                  </div>
                ) : (
                  thread.messages.map((m) => {
                    const mine = m.senderProfileId === meId;
                    if (m.type === "system") {
                      return (
                        <div key={m.id} className="flex justify-center">
                          <div className="max-w-[85%] rounded-2xl border border-forest/20 bg-limesoft/40 px-4 py-3 text-sm text-forest">
                            <p className="mb-1 flex items-center gap-1.5 font-bold">
                              <Send className="h-3.5 w-3.5" aria-hidden="true" />
                              Permintaan
                            </p>
                            <p className="whitespace-pre-line text-ink">{m.body}</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            mine
                              ? "rounded-br-sm bg-forest text-white"
                              : "rounded-bl-sm border border-line bg-white text-ink"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-moss"}`}>
                            {jam(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Balasan cepat */}
              <div className="flex flex-wrap gap-2 border-t border-line px-4 pt-3">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-moss transition-colors hover:border-forest hover:text-forest"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 p-4"
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="ring-focus h-12 flex-1 rounded-full border border-line bg-paper px-4 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="ring-focus grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest text-white transition-colors hover:bg-ink disabled:opacity-60"
                  aria-label="Kirim"
                >
                  {sending ? <Spinner className="h-5 w-5" /> : <Send className="h-5 w-5" aria-hidden="true" />}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ChatInbox;
