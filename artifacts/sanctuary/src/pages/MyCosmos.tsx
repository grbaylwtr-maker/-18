import { useListBookmarks, useRemoveBookmark, getListBookmarksQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { CosmicBackground } from "../components/CosmicBackground";

function getSpectralToken(): string {
  let token = localStorage.getItem("spectralToken");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("spectralToken", token);
  }
  return token;
}

const TYPE_CONFIG: Record<string, { color: string; glyph: string; label: string }> = {
  tale:       { color: "#FBBF24", glyph: "✿", label: "الحكايات" },
  expression: { color: "#FB923C", glyph: "⬟", label: "التعبير الحر" },
  galaxy:     { color: "#C4B5FD", glyph: "✦", label: "المجرات" },
};

export function MyCosmos() {
  const token = getSpectralToken();
  const queryClient = useQueryClient();
  const { data: bookmarks = [], isLoading } = useListBookmarks({ spectralToken: token });
  const removeBookmark = useRemoveBookmark();
  const [removing, setRemoving] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const grouped = bookmarks.reduce<Record<string, typeof bookmarks>>((acc, b) => {
    if (!acc[b.contentType]) acc[b.contentType] = [];
    acc[b.contentType].push(b);
    return acc;
  }, {});

  const filtered = filter === "all" ? bookmarks : bookmarks.filter(b => b.contentType === filter);

  const handleRemove = async (id: string) => {
    setRemoving(id);
    try {
      await removeBookmark.mutateAsync({ bookmarkId: id });
      queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey({ spectralToken: token }) });
    } finally {
      setRemoving(null);
    }
  };

  const types = Object.keys(grouped);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground nebulaColor="#C4B5FD" nebulaColor2="#0B0E14" intensity={0.6} shootingStars />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-4xl block mb-3 animate-breathe text-purple-300">◉</span>
          <h1 className="text-4xl font-light tracking-widest mb-1 text-purple-200">كوني الخاص</h1>
          <p className="text-white/30 text-xs tracking-widest">المحتوى الذي حفظته طيفك</p>
        </motion.div>

        {/* Filter tabs */}
        {types.length > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            <button
              onClick={() => setFilter("all")}
              className="px-4 py-1.5 rounded-full text-xs border transition-all"
              style={{
                borderColor: filter === "all" ? "#C4B5FD" : "rgba(255,255,255,0.1)",
                background: filter === "all" ? "#C4B5FD15" : "transparent",
                color: filter === "all" ? "#C4B5FD" : "rgba(255,255,255,0.3)",
              }}
            >
              ◎ الكل ({bookmarks.length})
            </button>
            {types.map(t => {
              const cfg = TYPE_CONFIG[t] ?? { color: "#C4B5FD", glyph: "◎", label: t };
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className="px-4 py-1.5 rounded-full text-xs border transition-all"
                  style={{
                    borderColor: filter === t ? cfg.color : "rgba(255,255,255,0.1)",
                    background: filter === t ? `${cfg.color}15` : "transparent",
                    color: filter === t ? cfg.color : "rgba(255,255,255,0.3)",
                  }}
                >
                  {cfg.glyph} {cfg.label} ({grouped[t].length})
                </button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border border-purple-400/40 border-t-purple-400 animate-spin mx-auto" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }} className="text-center py-16">
            <p className="text-white/15 text-xs tracking-widest leading-loose">
              لم تحفظ أي محتوى بعد
              <br />
              يمكنك حفظ الحكايات والتعبيرات هنا
            </p>
          </motion.div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((b, i) => {
              const cfg = TYPE_CONFIG[b.contentType] ?? { color: "#C4B5FD", glyph: "◎", label: b.contentType };
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-2xl border bg-white/3 group relative"
                  style={{ borderColor: `${cfg.color}20` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: cfg.color }}>
                        {cfg.glyph}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white/70 text-sm font-medium leading-tight mb-1 truncate">
                          {b.title ?? "محتوى محفوظ"}
                        </p>
                        {b.excerpt && (
                          <p className="text-white/30 text-xs leading-relaxed line-clamp-2">{b.excerpt}</p>
                        )}
                        <p className="text-white/15 text-[10px] mt-2">
                          <span style={{ color: `${cfg.color}60` }}>{cfg.label}</span>
                          {" · "}
                          {new Date(b.createdAt).toLocaleDateString("ar", { month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(b.id)}
                      disabled={removing === b.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 text-xs flex-shrink-0 p-1"
                    >
                      {removing === b.id ? "..." : "✕"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
