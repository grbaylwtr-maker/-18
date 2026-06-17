import { useGetSanctuaryResources, useSanctuaryCheckIn } from "@workspace/api-client-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "../components/CosmicBackground";

const MOODS = [
  { v: 1, ar: "أحتاج مساعدة عاجلة", color: "#FCA5A5" },
  { v: 2, ar: "أشعر بثقل كبير",     color: "#C4B5FD" },
  { v: 3, ar: "مستمر لكن بصعوبة",   color: "#93C5FD" },
  { v: 4, ar: "بخير نسبياً",         color: "#86EFAC" },
  { v: 5, ar: "أشعر بالأمان",        color: "#FDE047" },
];

const BREATHS = [
  { label: "استنشق", duration: 4 },
  { label: "احبس",   duration: 4 },
  { label: "أطلق",   duration: 6 },
];

const SUPPORT_MSGS = [
  "أنت قوي بطريقة لا تراها.",
  "هذه اللحظة ستمر. أنت مررت بأشد منها.",
  "طلب المساعدة شجاعة، ليس ضعفاً.",
  "وجودك هنا يعني أنك ما زلت تقاوم. هذا كافٍ.",
  "أنت لست وحدك في هذا الفضاء.",
];

export function Sanctuary() {
  const { data: resources } = useGetSanctuaryResources();
  const checkIn = useSanctuaryCheckIn();
  const [mood, setMood] = useState<number | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [breathActive, setBreathActive] = useState(false);
  const [breathIdx, setBreathIdx] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [msgIdx] = useState(() => Math.floor(Math.random() * SUPPORT_MSGS.length));

  const selectedMood = MOODS.find(m => m.v === mood);

  const handleCheckIn = async () => {
    if (!mood) return;
    try {
      await checkIn.mutateAsync({ data: { mood } });
    } catch {}
    setCheckedIn(true);
  };

  const startBreath = () => {
    setBreathActive(true);
    setBreathIdx(0);
    let idx = 0;
    const run = () => {
      idx = (idx + 1) % BREATHS.length;
      setBreathIdx(idx);
      setTimeout(run, BREATHS[idx].duration * 1000);
    };
    setTimeout(run, BREATHS[0].duration * 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <CosmicBackground nebulaColor="#C4B5FD" nebulaColor2="#0A0010" intensity={0.9} shootingStars={false} />

      <div className="relative z-10 flex flex-col items-center px-4 pt-10 pb-32 md:pb-12 md:pr-24 max-w-2xl mx-auto w-full">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.span
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-4xl block mb-3 text-pink-300"
          >♡</motion.span>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-2 text-purple-200">الملاذ الأخير</h1>
          <p className="text-white/30 text-xs tracking-widest">Last Sanctuary · أنت بأمان هنا</p>
        </motion.div>

        {/* Support message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full p-5 rounded-2xl border border-purple-400/20 bg-purple-400/5 mb-8 text-center"
        >
          <p className="text-purple-200/80 text-base font-light leading-relaxed italic">
            "{SUPPORT_MSGS[msgIdx]}"
          </p>
        </motion.div>

        {/* Breathing exercise */}
        <div className="w-full mb-8">
          <h2 className="text-white/40 text-xs tracking-widest text-center mb-4">تمرين تنفس طارئ</h2>
          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={breathActive ? () => setBreathActive(false) : startBreath}
              animate={{
                scale: breathActive ? [1, 1.15, 1] : 1,
                boxShadow: breathActive ? ["0 0 20px -8px #C4B5FD", "0 0 50px -4px #C4B5FD", "0 0 20px -8px #C4B5FD"] : "none",
              }}
              transition={{ scale: { duration: breathActive ? BREATHS[breathIdx].duration : 0.3, repeat: breathActive ? Infinity : 0 }, boxShadow: { duration: BREATHS[breathIdx]?.duration ?? 4, repeat: Infinity } }}
              className="w-28 h-28 rounded-full border-2 border-purple-400/40 bg-purple-400/10 flex flex-col items-center justify-center cursor-pointer"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={breathIdx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-purple-200 text-sm font-light tracking-wider"
                >
                  {breathActive ? BREATHS[breathIdx].label : "ابدأ"}
                </motion.span>
              </AnimatePresence>
              {breathActive && (
                <span className="text-white/30 text-xs mt-1">{BREATHS[breathIdx].duration}ث</span>
              )}
            </motion.button>
            <p className="text-white/20 text-xs tracking-widest">
              {breathActive ? "٤-٤-٦ · اضغط للإيقاف" : "اضغط للبدء"}
            </p>
          </div>
        </div>

        {/* Mood check-in */}
        {!checkedIn ? (
          <div className="w-full mb-8">
            <h2 className="text-white/40 text-xs tracking-widest text-center mb-4">كيف تشعر الآن؟</h2>
            <div className="space-y-2">
              {MOODS.map((m, i) => (
                <motion.button
                  key={m.v}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  onClick={() => setMood(m.v)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-right"
                  style={{
                    borderColor: mood === m.v ? m.color : "rgba(255,255,255,0.07)",
                    background: mood === m.v ? `${m.color}12` : "rgba(255,255,255,0.02)",
                    boxShadow: mood === m.v ? `0 0 20px -6px ${m.color}` : "none",
                  }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: mood === m.v ? m.color : "rgba(255,255,255,0.15)" }} />
                  <span className="text-sm" style={{ color: mood === m.v ? m.color : "rgba(255,255,255,0.6)" }}>
                    {m.ar}
                  </span>
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={!mood || checkIn.isPending}
              onClick={handleCheckIn}
              className="w-full mt-4 py-3.5 rounded-xl text-sm transition-all disabled:opacity-30"
              style={{
                background: selectedMood ? `${selectedMood.color}25` : "rgba(255,255,255,0.05)",
                border: `1px solid ${selectedMood?.color ?? "rgba(255,255,255,0.1)"}`,
                color: selectedMood?.color ?? "rgba(255,255,255,0.3)",
              }}
            >
              {checkIn.isPending ? "يُسجَّل..." : "أعلمهم أنك هنا"}
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full mb-8 p-5 rounded-2xl border text-center"
            style={{
              borderColor: `${selectedMood?.color ?? "#C4B5FD"}30`,
              background: `${selectedMood?.color ?? "#C4B5FD"}08`,
            }}
          >
            <p className="text-sm mb-1" style={{ color: selectedMood?.color ?? "#C4B5FD" }}>
              ✓ سُجِّلت حالتك — الأطياف المجاورة تعلم
            </p>
            <p className="text-white/30 text-xs">لست وحدك في هذه اللحظة</p>
          </motion.div>
        )}

        {/* External help */}
        <div className="w-full">
          <button
            onClick={() => setShowHelp(h => !h)}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/3 text-white/30 text-xs hover:text-white/60 hover:bg-white/8 transition-all duration-300"
          >
            {showHelp ? "▲ إخفاء" : "▼ مساعدة خارجية"}
          </button>

          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-2">
                  {[
                    { name: "خط مساندة السعودية", num: "920033360", color: "#86EFAC" },
                    { name: "طوارئ الأزمات النفسية", num: "920033360", color: "#93C5FD" },
                    { name: "التحدث مع متطوع", num: "منصة متوفرة", color: "#C4B5FD" },
                  ].map(line => (
                    <div key={line.name}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2">
                      <span className="text-white/40 text-xs">{line.name}</span>
                      <span className="text-xs font-medium" style={{ color: line.color }}>{line.num}</span>
                    </div>
                  ))}
                  <p className="text-white/15 text-[10px] text-center py-1">
                    هذه الأرقام مجهولة وآمنة تماماً
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-white/10 text-xs tracking-widest"
        >
          "أنت لم تصل إلى هنا صدفة. شيء فيك يقاوم — اسمعه."
        </motion.p>
      </div>
    </div>
  );
}
