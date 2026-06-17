import { useListReels, useResonateReel } from "@workspace/api-client-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { CosmicBackground } from "../components/CosmicBackground";

const EMOTION_COLORS: Record<string, string> = {
  "ألم هادئ":    "#A78BFA",
  "أمل بعيد":    "#FDE047",
  "حرية":       "#2DD4BF",
  "حزن عميق":   "#60A5FA",
  "سلام داخلي": "#86EFAC",
  "دهشة كونية": "#F472B6",
  "غضب مكتوم":  "#FCA5A5",
  "وحدة":       "#818CF8",
};

const DEFAULT_GRADIENT = ["#1E1B4B", "#0B0E14"];

function getGradient(tag: string) {
  const c = EMOTION_COLORS[tag];
  if (!c) return DEFAULT_GRADIENT;
  return [c + "60", "#0B0E14"];
}

export function Mirrors() {
  const { data: reelsPage, isLoading } = useListReels();
  const resonateReel = useResonateReel();
  const reels = reelsPage?.items ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [resonated, setResonated] = useState<Set<string | number>>(new Set());
  const [showRipple, setShowRipple] = useState(false);
  const [counts, setCounts] = useState<Record<string | number, number>>({});

  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentReel = reels[currentIndex];

  useEffect(() => {
    if (reels.length) {
      const map: Record<string | number, number> = {};
      reels.forEach(r => { map[r.id] = r.resonanceCount ?? 0; });
      setCounts(map);
    }
  }, [reels]);

  const goNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setDirection("up");
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, reels.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("down");
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  const handleResonate = useCallback(() => {
    if (!currentReel) return;
    if (resonated.has(currentReel.id)) return;
    resonateReel.mutate({ reelId: currentReel.id });
    setResonated(s => new Set([...s, currentReel.id]));
    setCounts(c => ({ ...c, [currentReel.id]: (c[currentReel.id] ?? 0) + 1 }));
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1200);
  }, [currentReel, resonated, resonateReel]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY > 30) goNext();
    else if (e.deltaY < -30) goPrev();
  }, [goNext, goPrev]);

  const dragY = useMotionValue(0);
  const bgOpacity = useTransform(dragY, [-200, 0, 200], [0.5, 1, 0.5]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <CosmicBackground nebulaColor="#A78BFA" nebulaColor2="#312E81" shootingStars={false} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-purple-400/30 border-t-purple-400 animate-spin" />
          <p className="text-purple-300/60 text-sm tracking-widest animate-pulse">تتأمل المرايا...</p>
        </div>
      </div>
    );
  }

  if (!reels.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <CosmicBackground nebulaColor="#A78BFA" nebulaColor2="#312E81" />
        <div className="relative z-10 text-center">
          <p className="text-5xl mb-4 opacity-40">▣</p>
          <p className="text-white/30 tracking-widest">المرايا فارغة اليوم</p>
        </div>
      </div>
    );
  }

  const colors = getGradient(currentReel?.emotionTag ?? "");
  const isResonated = resonated.has(currentReel?.id ?? "");

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden relative bg-black touch-pan-y select-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <CosmicBackground
        nebulaColor={EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#A78BFA"}
        nebulaColor2="#0B0E14"
        shootingStars={false}
        intensity={0.6}
      />

      {/* Reel viewport */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="relative w-full max-w-sm h-full md:h-[90vh] md:rounded-3xl overflow-hidden">

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentReel?.id}
              custom={direction}
              variants={{
                enter: (dir: string) => ({ y: dir === "up" ? "100%" : "-100%", opacity: 0 }),
                center: { y: 0, opacity: 1 },
                exit: (dir: string) => ({ y: dir === "up" ? "-100%" : "100%", opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.8 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y < -60) goNext();
                else if (info.offset.y > 60) goPrev();
              }}
              style={{ opacity: bgOpacity }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Background image / gradient */}
              <div className="absolute inset-0">
                {currentReel?.thumbnailUrl ? (
                  <img
                    src={currentReel.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
                    draggable={false}
                  />
                ) : null}
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, ${colors[0]}, ${colors[1]} 60%)` }}
                />
              </div>

              {/* Ambient glow orb */}
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-slow-breathe"
                style={{ background: `radial-gradient(circle, ${EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#A78BFA"}30, transparent)` }}
              />

              {/* Bottom overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 pb-10 flex gap-4">
                {/* Text */}
                <div className="flex-1">
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block mb-3 px-3 py-1 rounded-full text-xs border backdrop-blur-md font-medium"
                    style={{
                      color: EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD",
                      borderColor: (EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD") + "40",
                      background: (EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD") + "15",
                    }}
                  >
                    #{currentReel?.emotionTag}
                  </motion.span>

                  {currentReel?.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/90 text-base md:text-lg leading-relaxed font-light"
                    >
                      {currentReel.description}
                    </motion.p>
                  )}

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/30 text-xs mt-2 tracking-widest"
                  >
                    {currentReel?.durationSeconds}ث · من روح مجهولة
                  </motion.p>
                </div>

                {/* Side actions */}
                <div className="flex flex-col items-center gap-5 self-end">
                  {/* Resonate button */}
                  <button
                    onClick={handleResonate}
                    className="relative flex flex-col items-center gap-1.5 group"
                    disabled={isResonated}
                  >
                    {showRipple && (
                      <>
                        <div className="absolute inset-0 rounded-full animate-ripple"
                          style={{ background: EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD" }} />
                        <div className="absolute inset-0 rounded-full animate-ripple"
                          style={{ background: EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD", animationDelay: "0.3s" }} />
                      </>
                    )}
                    <motion.div
                      whileTap={{ scale: 1.4 }}
                      className="w-12 h-12 rounded-full border flex items-center justify-center backdrop-blur-md transition-all"
                      style={{
                        borderColor: isResonated
                          ? (EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD")
                          : "rgba(255,255,255,0.15)",
                        background: isResonated
                          ? (EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD") + "30"
                          : "rgba(255,255,255,0.05)",
                        boxShadow: isResonated
                          ? `0 0 20px -4px ${EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD"}`
                          : "none",
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill={isResonated ? "currentColor" : "none"}
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: isResonated ? (EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD") : "rgba(255,255,255,0.6)" }}>
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </motion.div>
                    <span className="text-white/50 text-[11px] tabular-nums">
                      {counts[currentReel?.id ?? ""] ?? 0}
                    </span>
                    <span className="text-white/20 text-[9px] tracking-wider">رنين</span>
                  </button>

                  {/* Progress indicator */}
                  <div className="flex flex-col gap-1.5 items-center">
                    {reels.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDirection(i > currentIndex ? "up" : "down");
                          setCurrentIndex(i);
                        }}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === currentIndex ? "3px" : "2px",
                          height: i === currentIndex ? "20px" : "6px",
                          background: i === currentIndex
                            ? (EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD")
                            : "rgba(255,255,255,0.2)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows (desktop) */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30 hidden md:flex">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-9 h-9 rounded-full void-glass text-white/40 flex items-center justify-center disabled:opacity-10 hover:text-white transition-colors"
            >
              ↑
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === reels.length - 1}
              className="w-9 h-9 rounded-full void-glass text-white/40 flex items-center justify-center disabled:opacity-10 hover:text-white transition-colors"
            >
              ↓
            </button>
          </div>

          {/* Swipe hint (first load) */}
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 3, duration: 1 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-white/30 text-xs tracking-widest"
            >
              ↕ مرر للتنقل
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Music wave visualizer (decorative) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-0.5 z-20 opacity-20">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full animate-wave-bar"
            style={{
              background: EMOTION_COLORS[currentReel?.emotionTag ?? ""] ?? "#C4B5FD",
              animationDuration: `${0.6 + Math.sin(i * 0.8) * 0.4}s`,
              animationDelay: `${i * 0.05}s`,
              height: "4px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
