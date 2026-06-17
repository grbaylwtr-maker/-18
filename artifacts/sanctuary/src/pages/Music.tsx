import { motion } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { CosmicBackground } from "../components/CosmicBackground";

const MOODS = [
  { id: "longing",   ar: "شوق وحنين",      color: "#60A5FA", bars: [3,7,12,8,5,14,9,4,11,6,13,7,3,9,11] },
  { id: "peace",     ar: "سلام داخلي",      color: "#86EFAC", bars: [4,5,6,5,4,6,5,4,5,6,4,5,6,5,4] },
  { id: "rage",      ar: "غضب صامت",        color: "#FCA5A5", bars: [10,14,8,15,12,7,13,11,9,14,8,12,15,10,13] },
  { id: "wonder",    ar: "دهشة وذهول",      color: "#FDE047", bars: [5,8,12,10,6,14,9,7,13,11,5,10,12,8,6] },
  { id: "solitude",  ar: "وحدة اختيارية",   color: "#C4B5FD", bars: [2,4,3,5,2,4,3,2,4,3,5,2,4,3,2] },
  { id: "euphoria",  ar: "نشوة حرة",        color: "#F472B6", bars: [8,12,15,11,9,14,12,10,13,11,15,9,12,14,10] },
];

const SHARED_SESSIONS = [
  { id: 1, mood: "شوق وحنين",    listeners: 23, color: "#60A5FA", duration: "4:12" },
  { id: 2, mood: "سلام داخلي",   listeners: 47, color: "#86EFAC", duration: "6:33" },
  { id: 3, mood: "دهشة وذهول",   listeners: 15, color: "#FDE047", duration: "3:58" },
  { id: 4, mood: "وحدة اختيارية", listeners: 89, color: "#C4B5FD", duration: "8:17" },
];

export function Music() {
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [joined, setJoined] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const togglePlay = useCallback(() => {
    setIsPlaying(p => !p);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor={selectedMood.color}
        nebulaColor2="#0F172A"
        shootingStars={false}
        intensity={0.8}
      />

      <div className="relative z-10 flex flex-col items-center px-4 pt-10 pb-32 md:pb-10 md:pr-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-4xl mb-3 block animate-breathe" style={{ color: selectedMood.color }}>♫</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-2" style={{ color: selectedMood.color }}>
            الأصداء الموسيقية
          </h1>
          <p className="text-white/40 text-sm tracking-widest">Musical Echoes</p>
          <p className="text-white/30 text-xs mt-3 max-w-sm mx-auto leading-relaxed">
            الموسيقى لغة الروح — شارك ما تشعر به دون كلمات
          </p>
        </motion.div>

        {/* Mood selector */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10 max-w-2xl w-full">
          {MOODS.map((mood, i) => (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedMood(mood)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300"
              style={{
                borderColor: selectedMood.id === mood.id ? mood.color : "rgba(255,255,255,0.08)",
                background: selectedMood.id === mood.id ? `${mood.color}15` : "rgba(255,255,255,0.03)",
                boxShadow: selectedMood.id === mood.id ? `0 0 20px -6px ${mood.color}` : "none",
              }}
            >
              <div className="flex items-end gap-0.5 h-8">
                {mood.bars.slice(0, 5).map((h, j) => (
                  <div
                    key={j}
                    className="w-1 rounded-full animate-wave-bar"
                    style={{
                      background: mood.color,
                      animationDuration: `${0.5 + j * 0.15}s`,
                      animationDelay: `${j * 0.1}s`,
                      height: isPlaying && selectedMood.id === mood.id ? `${h * 2}px` : "4px",
                      transition: "height 0.4s ease",
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-center leading-tight" style={{ color: mood.color }}>
                {mood.ar}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Main visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-72 h-72 mb-10"
        >
          {/* Outer rings */}
          {[1, 0.7, 0.45].map((scale, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border"
              animate={{ scale: isPlaying ? [scale, scale * 1.08, scale] : scale, opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2 + i * 0.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                borderColor: `${selectedMood.color}${40 - i * 10}`,
                top: `${i * 10}%`,
                left: `${i * 10}%`,
                right: `${i * 10}%`,
                bottom: `${i * 10}%`,
              }}
            />
          ))}

          {/* Center play button */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center rounded-full transition-all duration-500"
            style={{
              background: `radial-gradient(circle at center, ${selectedMood.color}30, transparent 70%)`,
            }}
          >
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 rounded-full flex items-center justify-center border-2 backdrop-blur-md"
              style={{
                borderColor: selectedMood.color,
                background: `${selectedMood.color}20`,
                boxShadow: `0 0 30px -6px ${selectedMood.color}`,
              }}
            >
              <span className="text-3xl" style={{ color: selectedMood.color }}>
                {isPlaying ? "⏸" : "▶"}
              </span>
            </motion.div>
          </button>

          {/* Wave bars around */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            <div className="flex items-end gap-0.5 pb-2">
              {selectedMood.bars.map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: selectedMood.color,
                    height: isPlaying ? `${h * 3}px` : "4px",
                    opacity: 0.6 + (i / selectedMood.bars.length) * 0.4,
                    animation: isPlaying ? `wave-bar ${0.4 + i * 0.07}s ease-in-out infinite alternate` : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Shared listening rooms */}
        <div className="max-w-lg w-full">
          <h2 className="text-white/40 text-xs tracking-widest uppercase text-center mb-4">
            غرف الاستماع المشتركة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SHARED_SESSIONS.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:border-white/20"
                style={{
                  borderColor: joined === session.id ? session.color : "rgba(255,255,255,0.08)",
                  background: joined === session.id ? `${session.color}10` : "rgba(255,255,255,0.03)",
                }}
                onClick={() => setJoined(s => s === session.id ? null : session.id)}
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg animate-breathe"
                  style={{ background: `${session.color}20`, color: session.color }}
                >
                  ♫
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{session.mood}</p>
                  <p className="text-white/30 text-xs">{session.listeners} مستمع · {session.duration}</p>
                </div>
                {joined === session.id && (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: session.color }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
