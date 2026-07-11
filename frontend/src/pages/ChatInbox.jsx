import { Link } from "react-router-dom";
import { conversations } from "../data/chats";
import { categoryMap, getWorker } from "../data/workers";
import { SearchIcon, ChatIcon } from "../components/icons";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const ChatInbox = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <ChatIcon className="h-6 w-6 text-forest" />
        <h1 className="text-2xl font-extrabold text-ink">Pesan</h1>
      </div>
      <p className="mt-1 text-sm text-moss">
        Riwayat percakapan kamu dengan para pekerja.
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
        <SearchIcon className="h-5 w-5 text-moss" />
        <input
          placeholder="Cari percakapan"
          className="w-full bg-transparent text-sm text-ink placeholder:text-moss/70 focus:outline-none"
        />
      </div>

      <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {conversations.map((c) => {
          const w = getWorker(c.workerId);
          const cat = categoryMap[w.category];
          return (
            <Link
              key={c.workerId}
              to={`/chat/${c.workerId}`}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper"
            >
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-bold text-white"
                style={{ background: cat.color }}
              >
                {initials(w.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-ink">{w.name}</p>
                  <span className="shrink-0 text-xs text-moss">{c.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-moss">{c.last}</p>
                  {c.unread > 0 && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-forest px-1.5 text-[11px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ChatInbox;
