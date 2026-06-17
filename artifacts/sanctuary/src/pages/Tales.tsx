import {
  useListTales,
  useCreateTale,
  usePulseTale,
  useGetTaleComments,
  useAddTaleComment,
  useAddBookmark,
  useRemoveBookmark,
  getListTalesQueryKey,
  getGetTaleCommentsQueryKey,
} from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "../components/CosmicBackground";

function getSpectralToken(): string {
  let token = localStorage.getItem("spectralToken");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("spectralToken", token);
  }
  return token;
}

const GENRE_COLORS: Record<string, string> = {
  real:       "#FCA5A5",
  personal:   "#C4B5FD",
  philosophy: "#818CF8",
  love:       "#F472B6",
  survival:   "#86EFAC",
  loneliness: "#60A5FA",
  fantasy:    "#FDE047",
  anger:      "#FB923C",
};

const GENRE_AR: Record<string, string> = {
  real:       "حقيقية",
  personal:   "شخصية",
  philosophy: "فلسفة",
  love:       "حب",
  survival:   "نجاة",
  loneliness: "وحدة",
  fantasy:    "خيال",
  anger:      "غضب",
};

function TaleComments({ taleId, color }: { taleId: string; color: string }) {
  const spectralColor = localStorage.getItem("spectralColor") ?? "#C4B5FD";
  const queryClient = useQueryClient();
  const { data: comments = [], isLoading } = useGetTaleComments(taleId);
  const addComment = useAddTaleComment();
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    const t = text.trim();
    if (!t) return;
    await addComment.mutateAsync({ taleId, data: { content: t, spectralColor } });
    queryClient.invalidateQueries({ queryKey: getGetTaleCommentsQueryKey(taleId) });
    queryClient.invalidateQueries({ queryKey: getListTalesQueryKey() });
    setText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="pt-3 border-t mt-3" style={{ borderColor: `${color}20` }}>
        {isLoading ? (
          <p className="text-white/20 text-[10px] text-center py-2">...</p>
        ) : comments.length === 0 ? (
          <p className="text-white/20 text-[10px] text-center py-2">كن أول من يُعلّق</p>
        ) : (
          <div className="space-y-2 mb-3">
            {comments.map((c) => (
              <div key={c.id} className="text-[11px] leading-relaxed">
                <span className="text-white/20 text-[9px] ml-2">◉</span>
                <span className="text-white/55">{c.content}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="تعليق..."
            className="flex-1 bg-black/20 border rounded-lg px-3 py-1.5 text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none"
            style={{ borderColor: `${color}20` }}
            dir="rtl"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || addComment.isPending}
            className="px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-30"
            style={{ background: `${color}20`, color }}
          >
            ↑
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Tales() {
  const token = getSpectralToken();
  const { data: talesPage, isLoading } = useListTales();
  const pulseTale = usePulseTale();
  const createTale = useCreateTale();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Set<string>>(new Set());
  const [pulsed, setPulsed] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [bookmarkIds, setBookmarkIds] = useState<Record<string, string>>({});
  const [writing, setWriting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", genre: "personal" });

  const tales = talesPage?.items ?? [];
  const selected = tales.find((t) => t.id === selectedId);

  const handlePulse = (id: string) => {
    if (pulsed.has(id)) return;
    pulseTale.mutate({ taleId: id });
    setPulsed((p) => new Set([...p, id]));
  };

  const handleBookmark = async (tale: typeof tales[0]) => {
    const id = tale.id;
    if (bookmarked.has(id)) {
      const bmId = bookmarkIds[id];
      if (bmId) {
        await removeBookmark.mutateAsync({ bookmarkId: bmId });
        setBookmarked((b) => { const n = new Set(b); n.delete(id); return n; });
        setBookmarkIds((m) => { const n = { ...m }; delete n[id]; return n; });
      }
    } else {
      const res = await addBookmark.mutateAsync({
        data: {
          contentId: id,
          contentType: "tale",
          spectralToken: token,
          title: tale.title,
          excerpt: tale.excerpt ?? undefined,
        },
      });
      setBookmarked((b) => new Set([...b, id]));
      if (res?.id) setBookmarkIds((m) => ({ ...m, [id]: res.id }));
    }
  };

  const toggleComments = (id: string) => {
    setShowComments((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await createTale.mutateAsync({ data: { title: form.title, content: form.content, genre: form.genre } });
    queryClient.invalidateQueries({ queryKey: getListTalesQueryKey() });
    setForm({ title: "", content: "", genre: "personal" });
    setWriting(false);
  };

  const genres = Object.keys(GENRE_AR);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor={selected ? (GENRE_COLORS[selected.genre ?? ""] ?? "#FBBF24") : "#FBBF24"}
        nebulaColor2="#1A0E00"
        intensity={0.8}
        shootingStars
      />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-4xl block mb-3 animate-breathe text-yellow-300">✿</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-1 text-yellow-200">الحكايات</h1>
          <p className="text-white/40 text-sm tracking-widest mb-2">Tales Dimension</p>
          <p className="text-white/25 text-xs max-w-sm mx-auto leading-relaxed">
            قصص حقيقية ومتخيلة — تُحكى بأطياف مجهولة وتُحفظ في النجوم
          </p>
        </motion.div>

        {/* Write button */}
        <div className="flex justify-center mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setWriting((w) => !w)}
            className="px-6 py-2.5 rounded-full text-sm border transition-all duration-300"
            style={{
              borderColor: writing ? "#FBBF24" : "rgba(255,255,255,0.15)",
              background: writing ? "#FBBF2415" : "rgba(255,255,255,0.04)",
              color: writing ? "#FBBF24" : "rgba(255,255,255,0.5)",
            }}
          >
            {writing ? "✕ إغلاق" : "+ اكتب حكايتك"}
          </motion.button>
        </div>

        {/* Compose form */}
        <AnimatePresence>
          {writing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-xl mx-auto mb-8 overflow-hidden"
            >
              <div className="p-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 space-y-4">
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="عنوان الحكاية..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  dir="rtl"
                />
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="الحكاية..."
                  className="w-full h-32 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
                  dir="rtl"
                />
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm((f) => ({ ...f, genre: g }))}
                      className="px-3 py-1 rounded-full text-xs border transition-all"
                      style={{
                        borderColor: form.genre === g ? GENRE_COLORS[g] : "rgba(255,255,255,0.1)",
                        background: form.genre === g ? `${GENRE_COLORS[g]}20` : "transparent",
                        color: form.genre === g ? GENRE_COLORS[g] : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {GENRE_AR[g]}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!form.title.trim() || !form.content.trim() || createTale.isPending}
                  onClick={handleCreate}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 text-black"
                  style={{ background: "#FBBF24" }}
                >
                  {createTale.isPending ? "يُرسل..." : "أطلق الحكاية في الكون"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tales grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border border-yellow-300/20 border-t-yellow-300 animate-spin" />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tales.map((tale, i) => {
              const color = GENRE_COLORS[tale.genre ?? ""] ?? "#FBBF24";
              const isSelected = selectedId === tale.id;
              const isPulsed = pulsed.has(tale.id);
              const isBookmarked = bookmarked.has(tale.id);
              const commentsOpen = showComments.has(tale.id);

              return (
                <motion.div
                  key={tale.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 120 }}
                  className="relative rounded-2xl border transition-all duration-400 overflow-hidden"
                  style={{
                    borderColor: isSelected ? color : "rgba(255,255,255,0.07)",
                    background: isSelected ? `${color}0C` : "rgba(255,255,255,0.03)",
                    boxShadow: isSelected ? `0 0 40px -12px ${color}` : "none",
                  }}
                  onClick={() => setSelectedId((s) => (s === tale.id ? null : tale.id))}
                >
                  {/* Cosmic book cover */}
                  <div
                    className="h-24 relative overflow-hidden flex items-center justify-center cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${color}20, transparent)` }}
                  >
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div
                        key={j}
                        className="absolute rounded-full animate-twinkle"
                        style={{
                          width: ((j % 3) + 1) + "px",
                          height: ((j % 3) + 1) + "px",
                          background: color,
                          top: ((j * 13 + 5) % 95) + "%",
                          left: ((j * 17 + 10) % 90) + "%",
                          animationDuration: (j % 3 + 2) + "s",
                          opacity: 0.5,
                        }}
                      />
                    ))}
                    <span className="text-3xl opacity-30">✿</span>
                  </div>

                  <div className="p-4 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{ color, borderColor: `${color}30`, background: `${color}10` }}
                      >
                        {GENRE_AR[tale.genre ?? ""] ?? tale.genre}
                      </span>
                    </div>

                    <h3 className="font-medium text-sm mb-2 leading-snug text-white/90">{tale.title}</h3>

                    <AnimatePresence>
                      {isSelected ? (
                        <motion.p
                          key="full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-white/60 text-xs leading-relaxed mb-4"
                        >
                          {tale.content}
                        </motion.p>
                      ) : (
                        <p className="text-white/40 text-xs leading-relaxed line-clamp-3">{tale.content}</p>
                      )}
                    </AnimatePresence>

                    {/* Action bar */}
                    <div
                      className="mt-3 flex items-center gap-3 flex-wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Pulse */}
                      <button
                        onClick={() => handlePulse(tale.id)}
                        className="flex items-center gap-1.5 text-xs transition-all duration-300"
                        style={{ color: isPulsed ? color : "rgba(255,255,255,0.3)" }}
                      >
                        <motion.span
                          animate={{ scale: isPulsed ? [1, 1.5, 1] : 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          {isPulsed ? "♥" : "♡"}
                        </motion.span>
                        <span>{(tale.pulseCount ?? 0) + (isPulsed ? 1 : 0)}</span>
                      </button>

                      {/* Comments */}
                      <button
                        onClick={() => toggleComments(tale.id)}
                        className="flex items-center gap-1.5 text-xs transition-all duration-300"
                        style={{ color: commentsOpen ? color : "rgba(255,255,255,0.3)" }}
                      >
                        <span>◌</span>
                        <span>{tale.commentCount ?? 0}</span>
                      </button>

                      {/* Bookmark */}
                      <button
                        onClick={() => handleBookmark(tale)}
                        className="flex items-center gap-1 text-xs transition-all duration-300 mr-auto"
                        style={{ color: isBookmarked ? color : "rgba(255,255,255,0.2)" }}
                      >
                        <span>{isBookmarked ? "⊛" : "⊙"}</span>
                      </button>
                    </div>

                    {/* Comments panel */}
                    <AnimatePresence>
                      {commentsOpen && <TaleComments taleId={tale.id} color={color} />}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
