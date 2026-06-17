import {
  useListExpressions,
  useCreateExpression,
  useResonateExpression,
  getListExpressionsQueryKey,
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CosmicBackground } from "../components/CosmicBackground";

const TYPES = [
  { id: "all",    ar: "الكل",  glyph: "◎" },
  { id: "visual", ar: "بصري", glyph: "⬟" },
  { id: "poetry", ar: "شعر",  glyph: "✿" },
  { id: "motion", ar: "حركة", glyph: "◈" },
];

const SIZE_CLASSES: Record<string, string> = {
  large:  "md:col-span-2 md:row-span-2",
  medium: "md:col-span-1 md:row-span-2",
  small:  "md:col-span-1 md:row-span-1",
};

const TYPE_GLYPH: Record<string, string> = {
  visual: "⬟",
  poetry: "✿",
  motion: "◈",
  sound:  "♪",
};

const COLORS = ["#FB923C","#F472B6","#818CF8","#2DD4BF","#FDE047","#FCA5A5","#C4B5FD","#86EFAC"];

export function Expression() {
  const queryClient = useQueryClient();
  const { data: page, isLoading } = useListExpressions();
  const createExpression = useCreateExpression();
  const resonateExpression = useResonateExpression();

  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [resonated, setResonated] = useState<Set<string>>(new Set());
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ type: "visual", title: "", description: "", content: "", color: "#FB923C" });

  const items = page?.items ?? [];
  const filtered = filter === "all" ? items : items.filter((a) => a.type === filter);
  const active = items.find((a) => a.id === selected);

  const handleResonate = (id: string) => {
    if (resonated.has(id)) return;
    resonateExpression.mutate({ expressionId: id });
    setResonated((r) => new Set([...r, id]));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    await createExpression.mutateAsync({
      data: {
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        content: form.content || undefined,
        color: form.color,
        size: "medium",
      },
    });
    queryClient.invalidateQueries({ queryKey: getListExpressionsQueryKey() });
    setForm({ type: "visual", title: "", description: "", content: "", color: "#FB923C" });
    setComposing(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor={active?.color ?? "#FB923C"}
        nebulaColor2="#1A0A00"
        intensity={0.85}
        shootingStars
      />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-4xl block mb-3 animate-breathe" style={{ color: active?.color ?? "#FB923C" }}>⬟</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-1" style={{ color: active?.color ?? "#FB923C" }}>
            التعبير الحر
          </h1>
          <p className="text-white/40 text-sm tracking-widest mb-3">Free Expression · معرض كوني</p>
          <p className="text-white/25 text-xs max-w-sm mx-auto leading-relaxed">
            فن، شعر، رقص — كل شيء يعبر عن روح خفية
          </p>
        </motion.div>

        {/* Compose button */}
        <div className="flex justify-center mb-6">
          <motion.button
            onClick={() => setComposing((c) => !c)}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2 rounded-full text-xs border transition-all duration-300"
            style={{
              borderColor: composing ? "#FB923C" : "rgba(255,255,255,0.1)",
              background: composing ? "#FB923C15" : "transparent",
              color: composing ? "#FB923C" : "rgba(255,255,255,0.4)",
            }}
          >
            {composing ? "✕ إغلاق" : "⬟ أضف تعبيرك"}
          </motion.button>
        </div>

        {/* Compose form */}
        <AnimatePresence>
          {composing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-lg mx-auto mb-8 overflow-hidden"
            >
              <div className="p-5 rounded-3xl border border-orange-400/20 bg-orange-400/5 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {["visual","poetry","motion","sound"].map((t) => (
                    <button key={t}
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className="px-3 py-1 rounded-full text-xs border transition-all"
                      style={{
                        borderColor: form.type === t ? "#FB923C" : "rgba(255,255,255,0.1)",
                        background: form.type === t ? "#FB923C20" : "transparent",
                        color: form.type === t ? "#FB923C" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {TYPE_GLYPH[t]} {t === "visual" ? "بصري" : t === "poetry" ? "شعر" : t === "motion" ? "حركة" : "صوت"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="w-6 h-6 rounded-full transition-all"
                      style={{
                        background: c,
                        boxShadow: form.color === c ? `0 0 10px ${c}` : "none",
                        transform: form.color === c ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="عنوان التعبير..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none"
                  dir="rtl"
                />
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="وصف مختصر..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none"
                  dir="rtl"
                />
                {form.type === "poetry" && (
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="نص القصيدة..."
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 resize-none focus:outline-none"
                    dir="rtl"
                  />
                )}
                <button
                  onClick={handleCreate}
                  disabled={!form.title.trim() || createExpression.isPending}
                  className="w-full py-2.5 rounded-xl text-sm transition-all disabled:opacity-30"
                  style={{ background: `${form.color}20`, border: `1px solid ${form.color}40`, color: form.color }}
                >
                  {createExpression.isPending ? "..." : `${TYPE_GLYPH[form.type]} أطلق تعبيرك في الكون`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className="px-4 py-2 rounded-full text-xs border transition-all duration-300 flex items-center gap-1.5"
              style={{
                borderColor: filter === t.id ? "#FB923C" : "rgba(255,255,255,0.1)",
                background: filter === t.id ? "#FB923C20" : "transparent",
                color: filter === t.id ? "#FB923C" : "rgba(255,255,255,0.4)",
              }}
            >
              <span>{t.glyph}</span>
              <span>{t.ar}</span>
            </button>
          ))}
        </div>

        {/* Gallery grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border border-orange-400/20 border-t-orange-400 animate-spin" />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-3 md:gap-4 auto-rows-[120px]">
            {filtered.map((art, i) => {
              const isActive = selected === art.id;
              const isRes = resonated.has(art.id);
              return (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 140 }}
                  onClick={() => setSelected((s) => (s === art.id ? null : art.id))}
                  className={`relative rounded-2xl border cursor-pointer overflow-hidden transition-all duration-400 ${SIZE_CLASSES[art.size ?? "small"]}`}
                  style={{
                    borderColor: isActive ? art.color : "rgba(255,255,255,0.06)",
                    background: `linear-gradient(135deg, ${art.color}18, ${art.color}06)`,
                    boxShadow: isActive ? `0 0 40px -8px ${art.color}` : "none",
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="absolute rounded-full animate-twinkle"
                        style={{
                          width: "2px", height: "2px",
                          background: art.color,
                          top: ((j * 17 + 5) % 90) + "%",
                          left: ((j * 23 + 10) % 90) + "%",
                          animationDelay: j * 0.4 + "s",
                          opacity: 0.4,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] opacity-50" style={{ color: art.color }}>
                        {TYPE_GLYPH[art.type ?? "visual"]}
                      </span>
                      <h3 className="text-sm font-medium mt-1 leading-snug" style={{ color: art.color }}>
                        {art.title}
                      </h3>
                      <AnimatePresence>
                        {isActive ? (
                          <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {art.content && (
                              <p className="text-white/60 text-xs leading-relaxed mt-2 whitespace-pre-line">{art.content}</p>
                            )}
                            {!art.content && art.description && (
                              <p className="text-white/50 text-xs leading-relaxed mt-2">{art.description}</p>
                            )}
                            <p className="text-white/25 text-[10px] mt-1">{art.spectralAuthor}</p>
                          </motion.div>
                        ) : (
                          <motion.p key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/35 text-[11px] leading-relaxed mt-1 line-clamp-2">
                            {art.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleResonate(art.id); }}
                      className="mt-2 flex items-center gap-1.5 text-[11px] transition-all duration-300 w-fit"
                      style={{ color: isRes ? art.color : "rgba(255,255,255,0.25)" }}
                    >
                      <motion.span animate={{ scale: isRes ? [1, 1.5, 1] : 1 }} transition={{ duration: 0.4 }}>
                        {isRes ? "♥" : "♡"}
                      </motion.span>
                      <span>{(art.resonanceCount ?? 0) + (isRes ? 1 : 0)}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/15 text-xs tracking-widest">لا تعبيرات في هذا النوع بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
