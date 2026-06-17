import { useListMoods, useCreateMood, getListMoodsQueryKey } from "@workspace/api-client-react";
import { useState, useMemo } from "react";
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

const MOOD_CONFIG = [
  { value: 1, color: "#374151", glyph: "○", label: "محطم" },
  { value: 2, color: "#4B5563", glyph: "○", label: "منهك" },
  { value: 3, color: "#6B7280", glyph: "◌", label: "ثقيل" },
  { value: 4, color: "#818CF8", glyph: "◌", label: "قلق" },
  { value: 5, color: "#60A5FA", glyph: "◎", label: "عادي" },
  { value: 6, color: "#34D399", glyph: "◎", label: "هادئ" },
  { value: 7, color: "#86EFAC", glyph: "●", label: "بخير" },
  { value: 8, color: "#FDE047", glyph: "●", label: "جيد" },
  { value: 9, color: "#FB923C", glyph: "◉", label: "مبتهج" },
  { value: 10, color: "#F472B6", glyph: "◉", label: "رائع" },
];

const EMOTIONS = [
  "قلق", "وحيد", "ممتن", "مرهق", "أمل", "حزن", "هادئ", "غاضب", "فضولي", "سلام",
];

export function MoodJournal() {
  const token = getSpectralToken();
  const queryClient = useQueryClient();

  const { data: moods = [], isLoading } = useListMoods({ spectralToken: token });
  const createMood = useCreateMood();

  const [logging, setLogging] = useState(false);
  const [selectedMood, setSelectedMood] = useState(5);
  const [note, setNote] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const currentConfig = MOOD_CONFIG[selectedMood - 1];

  const avgMood = useMemo(() => {
    if (!moods.length) return null;
    return Math.round(moods.reduce((sum, m) => sum + m.mood, 0) / moods.length * 10) / 10;
  }, [moods]);

  const handleLog = async () => {
    await createMood.mutateAsync({
      data: {
        mood: selectedMood,
        spectralToken: token,
        note: note.trim() || undefined,
        emotion: selectedEmotion || undefined,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListMoodsQueryKey({ spectralToken: token }) });
    setNote("");
    setSelectedEmotion(null);
    setLogging(false);
  };

  const recent = moods.slice(0, 14);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor={currentConfig.color}
        nebulaColor2="#0B0E14"
        intensity={0.7}
        shootingStars={false}
      />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-4xl block mb-3 animate-breathe" style={{ color: currentConfig.color }}>
            {currentConfig.glyph}
          </span>
          <h1 className="text-4xl font-light tracking-widest mb-1" style={{ color: currentConfig.color }}>
            يوميات الطيف
          </h1>
          <p className="text-white/30 text-xs tracking-widest">سجّل مزاجك بلا هوية — فقط طيفك يراه</p>
        </motion.div>

        {/* Stats */}
        {moods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <div className="text-center p-3 rounded-2xl border border-white/5 bg-white/3">
              <p className="text-2xl font-light mb-1" style={{ color: MOOD_CONFIG[(Math.round(avgMood ?? 5) - 1)].color }}>
                {avgMood}
              </p>
              <p className="text-white/25 text-[10px] tracking-widest">متوسط</p>
            </div>
            <div className="text-center p-3 rounded-2xl border border-white/5 bg-white/3">
              <p className="text-2xl font-light mb-1 text-white/60">{moods.length}</p>
              <p className="text-white/25 text-[10px] tracking-widest">تسجيلة</p>
            </div>
            <div className="text-center p-3 rounded-2xl border border-white/5 bg-white/3">
              <p className="text-2xl font-light mb-1" style={{ color: MOOD_CONFIG[Math.max(...moods.map(m => m.mood)) - 1].color }}>
                {Math.max(...moods.map(m => m.mood))}
              </p>
              <p className="text-white/25 text-[10px] tracking-widest">أفضل</p>
            </div>
          </motion.div>
        )}

        {/* Mood history visualization */}
        {recent.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl border border-white/5 bg-white/3">
            <p className="text-white/30 text-xs mb-3 tracking-widest">آخر {recent.length} تسجيلة</p>
            <div className="flex items-end gap-1.5 h-12">
              {[...recent].reverse().map((m, i) => {
                const cfg = MOOD_CONFIG[m.mood - 1];
                return (
                  <motion.div
                    key={m.id}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex-1 rounded-t-sm origin-bottom"
                    style={{
                      height: `${(m.mood / 10) * 100}%`,
                      background: cfg.color,
                      opacity: 0.7,
                      minHeight: "4px",
                    }}
                    title={`${cfg.label} — ${new Date(m.createdAt).toLocaleDateString("ar")}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Log button */}
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={() => setLogging(l => !l)}
            whileTap={{ scale: 0.96 }}
            className="px-6 py-3 rounded-full border text-sm transition-all duration-300"
            style={{
              borderColor: logging ? currentConfig.color : "rgba(255,255,255,0.1)",
              background: logging ? `${currentConfig.color}15` : "transparent",
              color: logging ? currentConfig.color : "rgba(255,255,255,0.4)",
            }}
          >
            {logging ? "✕ إلغاء" : "+ سجّل مزاجك الآن"}
          </motion.button>
        </div>

        {/* Log form */}
        <AnimatePresence>
          {logging && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8 p-5 rounded-3xl border border-white/10 bg-white/3"
            >
              {/* Mood slider */}
              <p className="text-white/40 text-xs mb-4 text-center tracking-widest">كيف تشعر الآن؟</p>
              <div className="flex gap-1.5 justify-center mb-2 flex-wrap">
                {MOOD_CONFIG.map(cfg => (
                  <motion.button
                    key={cfg.value}
                    onClick={() => setSelectedMood(cfg.value)}
                    whileTap={{ scale: 0.85 }}
                    className="w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all duration-200"
                    style={{
                      background: selectedMood === cfg.value ? `${cfg.color}40` : "transparent",
                      border: `1px solid ${selectedMood === cfg.value ? cfg.color : "rgba(255,255,255,0.1)"}`,
                      color: cfg.color,
                      boxShadow: selectedMood === cfg.value ? `0 0 12px -2px ${cfg.color}` : "none",
                    }}
                  >
                    {cfg.value}
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-xs mb-5" style={{ color: currentConfig.color }}>
                {currentConfig.glyph} {currentConfig.label}
              </p>

              {/* Emotion tags */}
              <div className="flex gap-2 flex-wrap mb-4">
                {EMOTIONS.map(em => (
                  <button
                    key={em}
                    onClick={() => setSelectedEmotion(e => e === em ? null : em)}
                    className="px-3 py-1 rounded-full text-[11px] border transition-all"
                    style={{
                      borderColor: selectedEmotion === em ? currentConfig.color : "rgba(255,255,255,0.1)",
                      background: selectedEmotion === em ? `${currentConfig.color}20` : "transparent",
                      color: selectedEmotion === em ? currentConfig.color : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>

              {/* Note */}
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="ملاحظة اختيارية — ماذا تشعر؟"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 placeholder-white/20 text-xs resize-none focus:outline-none focus:border-white/20 mb-4"
                dir="rtl"
              />

              <button
                onClick={handleLog}
                disabled={createMood.isPending}
                className="w-full py-3 rounded-xl text-sm transition-all duration-300"
                style={{
                  background: `${currentConfig.color}20`,
                  border: `1px solid ${currentConfig.color}40`,
                  color: currentConfig.color,
                }}
              >
                {createMood.isPending ? "..." : `${currentConfig.glyph} سجّل — ${currentConfig.label}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History list */}
        {moods.length > 0 && (
          <div className="space-y-3">
            <p className="text-white/20 text-xs tracking-widest mb-4 text-center">سجل المزاج</p>
            {moods.map((m, i) => {
              const cfg = MOOD_CONFIG[m.mood - 1];
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-white/5 bg-white/2"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                    style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                  >
                    {m.mood}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
                      {m.emotion && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/30">
                          {m.emotion}
                        </span>
                      )}
                    </div>
                    {m.note && <p className="text-white/40 text-xs leading-relaxed">{m.note}</p>}
                    <p className="text-white/15 text-[10px] mt-1">
                      {new Date(m.createdAt).toLocaleDateString("ar", { month: "long", day: "numeric" })} ·{" "}
                      {new Date(m.createdAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && moods.length === 0 && !logging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} className="text-center py-12">
            <p className="text-white/15 text-xs tracking-widest leading-loose">
              لم تسجّل أي مزاج بعد
              <br />
              طيفك يحتفظ بتاريخك هنا
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
