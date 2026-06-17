import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "../components/CosmicBackground";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { phase: Phase; duration: number; ar: string; scale: number }[] = [
  { phase: "inhale",  duration: 4,  ar: "استنشق",   scale: 1.4 },
  { phase: "hold",    duration: 4,  ar: "احبس",    scale: 1.4 },
  { phase: "exhale",  duration: 6,  ar: "أطلق",    scale: 0.85 },
  { phase: "rest",    duration: 2,  ar: "استرح",   scale: 0.85 },
];

const SOUNDS = [
  { id: "rain",    ar: "مطر خفيف",      color: "#93C5FD" },
  { id: "forest",  ar: "غابة صاوتة",    color: "#86EFAC" },
  { id: "cosmos",  ar: "صمت الكون",     color: "#C4B5FD" },
  { id: "fire",    ar: "نار هادئة",     color: "#FCA5A5" },
];

const THOUGHTS = [
  "أنت هنا الآن. هذه اللحظة كافية.",
  "الهدوء ليس غياب الضوضاء — بل حضورك مع نفسك.",
  "كل نفَس هو بداية جديدة.",
  "لا شيء يجب عليك الآن. فقط كن.",
  "أنت أكثر مما يراه الآخرون.",
];

export function Simplicity() {
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [thoughtIdx, setThoughtIdx] = useState(0);

  const currentPhase = PHASES[phaseIdx];

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= currentPhase.duration) {
          setElapsed(0);
          setPhaseIdx(p => {
            const nextIdx = (p + 1) % PHASES.length;
            if (nextIdx === 0) setCycles(c => c + 1);
            return nextIdx;
          });
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, currentPhase.duration]);

  useEffect(() => {
    const id = setInterval(() => {
      setThoughtIdx(i => (i + 1) % THOUGHTS.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const progress = elapsed / currentPhase.duration;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      <CosmicBackground nebulaColor="#93C5FD" nebulaColor2="#0A1628" shootingStars={false} intensity={0.5} />

      <div className="relative z-10 flex flex-col items-center px-4 py-12 w-full max-w-sm">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
          <span className="text-4xl block mb-3 animate-breathe text-blue-300">○</span>
          <h1 className="text-3xl font-light tracking-widest mb-1 text-blue-200">البساطة</h1>
          <p className="text-white/25 text-xs tracking-widest">Simplicity · لا شيء يجب عليك الآن</p>
        </motion.div>

        {/* Breathing orb */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Outer rings */}
          <motion.div
            animate={{
              scale: active ? currentPhase.scale * 1.3 : 1.1,
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              scale: { duration: currentPhase.duration, ease: active && currentPhase.phase === "inhale" ? "easeIn" : "easeOut" },
              opacity: { duration: 4, repeat: Infinity },
            }}
            className="absolute w-52 h-52 rounded-full border border-blue-300/15"
          />
          <motion.div
            animate={{
              scale: active ? currentPhase.scale * 1.15 : 1,
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              scale: { duration: currentPhase.duration, ease: active && currentPhase.phase === "inhale" ? "easeIn" : "easeOut" },
              opacity: { duration: 3, repeat: Infinity, delay: 0.5 },
            }}
            className="absolute w-44 h-44 rounded-full border border-blue-300/20"
          />

          {/* Main orb */}
          <motion.button
            onClick={() => setActive(a => !a)}
            animate={{
              scale: active ? currentPhase.scale : 1,
              boxShadow: active
                ? `0 0 60px -8px #93C5FD`
                : "0 0 20px -8px #93C5FD40",
            }}
            transition={{
              scale: { duration: currentPhase.duration, ease: active && currentPhase.phase === "inhale" ? "easeIn" : "easeOut" },
              boxShadow: { duration: 0.5 },
            }}
            className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center border border-blue-300/30 bg-blue-300/5 cursor-pointer select-none z-10"
          >
            {/* Progress ring */}
            {active && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="72" cy="72" r="68"
                  fill="none"
                  stroke="#93C5FD"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray={`${2 * Math.PI * 68}`}
                  strokeDashoffset={`${2 * Math.PI * 68 * (1 - progress)}`}
                  strokeLinecap="round"
                />
              </svg>
            )}

            <AnimatePresence mode="wait">
              <motion.p
                key={currentPhase.phase}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-blue-200 text-sm tracking-widest font-light"
              >
                {active ? currentPhase.ar : "ابدأ"}
              </motion.p>
            </AnimatePresence>
            {active && (
              <p className="text-white/30 text-xs mt-1">{currentPhase.duration - elapsed}ث</p>
            )}
          </motion.button>
        </div>

        {/* Cycles count */}
        {cycles > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/20 text-xs mb-8">
            {cycles} دورة مكتملة
          </motion.p>
        )}

        {/* Ambient thought */}
        <div className="h-10 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={thoughtIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1 }}
              className="text-white/25 text-xs text-center italic tracking-wide"
            >
              "{THOUGHTS[thoughtIdx]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Sound selector */}
        <div className="w-full">
          <p className="text-white/20 text-[10px] tracking-widest text-center mb-3">أصوات الخلفية</p>
          <div className="grid grid-cols-4 gap-2">
            {SOUNDS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSound(p => p === s.id ? null : s.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-300"
                style={{
                  borderColor: selectedSound === s.id ? s.color : "rgba(255,255,255,0.07)",
                  background: selectedSound === s.id ? `${s.color}15` : "transparent",
                }}
              >
                {selectedSound === s.id && (
                  <div className="flex gap-0.5 items-end h-4">
                    {[2, 4, 3, 5, 2].map((h, i) => (
                      <div key={i} className="w-0.5 rounded-full animate-wave-bar"
                        style={{ background: s.color, height: `${h * 2}px`, animationDuration: `${0.5 + i * 0.1}s` }} />
                    ))}
                  </div>
                )}
                {selectedSound !== s.id && <div className="h-4 flex items-center">
                  <div className="w-1 h-1 rounded-full" style={{ background: s.color, opacity: 0.5 }} />
                </div>}
                <span className="text-[9px] text-center leading-tight" style={{ color: selectedSound === s.id ? s.color : "rgba(255,255,255,0.3)" }}>
                  {s.ar}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
