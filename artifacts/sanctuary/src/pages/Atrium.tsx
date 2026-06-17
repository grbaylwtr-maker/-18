import { useListDimensions, useGetAtriumStats } from "@workspace/api-client-react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { CosmicBackground } from "../components/CosmicBackground";
import { useState, useEffect } from "react";

const DIMENSIONS = [
  { id: "echo",       nameAr: "الصدى",             nameEn: "Echo",            color: "#60A5FA", glyph: "◎", desc: "محادثات عميقة 1-1 مع رفيق طيفي" },
  { id: "galaxy",     nameAr: "المجرة",            nameEn: "Galaxy",          color: "#FDE047", glyph: "✦", desc: "مساحات جماعية حول مشاعر مشتركة" },
  { id: "mirrors",    nameAr: "المرايا",           nameEn: "Mirrors",         color: "#A78BFA", glyph: "▣", desc: "ريلز تعبيرية قصيرة بلا أسماء" },
  { id: "music",      nameAr: "الأصداء الموسيقية", nameEn: "Musical Echoes",  color: "#34D399", glyph: "♫", desc: "مشاركة موسيقى تعبر عن الروح" },
  { id: "tales",      nameAr: "الحكايات",          nameEn: "Tales",           color: "#FBBF24", glyph: "✿", desc: "قصص وروايات ونبضات أدبية" },
  { id: "mystery",    nameAr: "الغموض",            nameEn: "Mystery",         color: "#C084FC", glyph: "⬡", desc: "أسرار تُرسل إلى الفراغ" },
  { id: "freedom",    nameAr: "الحرية",            nameEn: "Freedom",         color: "#FCD34D", glyph: "⊕", desc: "أفكار تحررية بلا حدود ولا أحكام" },
  { id: "kindred",    nameAr: "الأطياف المتشابهة", nameEn: "Kindred",         color: "#F472B6", glyph: "⋈", desc: "من يشاركونك نفس الهوية والتجربة" },
  { id: "simplicity", nameAr: "البساطة",           nameEn: "Simplicity",      color: "#93C5FD", glyph: "○", desc: "هدوء، تنفس، وتأمل" },
  { id: "complexity", nameAr: "التعقيد",           nameEn: "Complexity",      color: "#818CF8", glyph: "◈", desc: "فلسفة وعلوم ونقاش فكري عميق" },
  { id: "expression", nameAr: "التعبير الحر",      nameEn: "Expression",      color: "#FB923C", glyph: "⬟", desc: "فن ورقص وإبداع بلا قيود" },
  { id: "sanctuary",  nameAr: "الملاذ الأخير",     nameEn: "Last Sanctuary",  color: "#FCA5A5", glyph: "♡", desc: "دعم نفسي فوري للحظات الصعبة" },
];

export function Atrium() {
  const { data: stats } = useGetAtriumStats();
  const spectralColor = localStorage.getItem("spectralColor") || "#C4B5FD";
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      setTime(t => t + 1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const hovered = DIMENSIONS.find(d => d.id === hoveredId);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      onMouseMove={e => {
        mouseX.set(e.clientX / window.innerWidth - 0.5);
        mouseY.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <CosmicBackground
        nebulaColor={hovered?.color ?? spectralColor}
        nebulaColor2="#1E1B4B"
        shootingStars
      />

      {/* Subtle parallax nebula layer */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          x: useSpring(useMotionValue(0), { stiffness: 20, damping: 15 }),
          y: springY,
          zIndex: 1,
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: `radial-gradient(circle, ${hovered?.color ?? spectralColor}, transparent)` }} />
      </motion.div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-6 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/50 text-xs tracking-widest">
              {stats?.totalSpectersOnline ?? "∞"} طيف في الكون الآن
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-light tracking-widest mb-3 animate-text-glow"
            style={{ color: hovered?.color ?? spectralColor }}>
            الملاذ
          </h1>
          <p className="text-white/40 text-sm md:text-base font-light tracking-widest max-w-md mx-auto leading-relaxed">
            حيث يجد كل طيف صداه — دون أن يُعرف
          </p>
        </motion.div>
      </div>

      {/* Dimensional portals grid */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl w-full">
          {DIMENSIONS.map((dim, i) => {
            const isHov = hoveredId === dim.id;
            const pulse = Math.sin(time * 0.03 + i * 0.7) * 0.1 + 1;

            return (
              <Link key={dim.id} href={`/${dim.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 14 }}
                  onMouseEnter={() => setHoveredId(dim.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative flex flex-col items-center gap-3 cursor-pointer select-none"
                >
                  {/* Portal ring */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20">
                    {/* Outer ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border"
                      animate={{
                        borderColor: isHov ? dim.color : `${dim.color}30`,
                        boxShadow: isHov
                          ? `0 0 30px -4px ${dim.color}, 0 0 60px -20px ${dim.color}`
                          : `0 0 10px -6px ${dim.color}`,
                        scale: isHov ? 1.15 : pulse,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                    {/* Inner glow */}
                    <motion.div
                      className="absolute inset-2 rounded-full"
                      animate={{
                        background: isHov
                          ? `radial-gradient(circle at center, ${dim.color}60, ${dim.color}10)`
                          : `radial-gradient(circle at center, ${dim.color}20, transparent)`,
                        scale: isHov ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                    {/* Spinning ring on hover */}
                    <AnimatePresence>
                      {isHov && (
                        <motion.div
                          initial={{ opacity: 0, rotate: 0 }}
                          animate={{ opacity: 1, rotate: 360 }}
                          exit={{ opacity: 0 }}
                          transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.3 } }}
                          className="absolute -inset-2 rounded-full border border-dashed"
                          style={{ borderColor: `${dim.color}40` }}
                        />
                      )}
                    </AnimatePresence>
                    {/* Glyph */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        animate={{ scale: isHov ? 1.3 : 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl md:text-3xl font-light z-10"
                        style={{ color: dim.color }}
                      >
                        {dim.glyph}
                      </motion.span>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <motion.p
                      animate={{ color: isHov ? dim.color : "rgba(255,255,255,0.7)" }}
                      className="text-xs md:text-sm font-medium tracking-wide leading-tight"
                    >
                      {dim.nameAr}
                    </motion.p>
                    <p className="text-white/25 text-[10px] tracking-widest uppercase mt-0.5">
                      {dim.nameEn}
                    </p>
                  </div>

                  {/* Tooltip on hover */}
                  <AnimatePresence>
                    {isHov && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        className="absolute top-full mt-2 w-44 text-center text-[11px] text-white/60 leading-relaxed px-3 py-2 rounded-xl void-glass z-20 pointer-events-none"
                      >
                        {dim.desc}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Bottom quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-white/20 text-xs tracking-widest text-center italic font-light"
        >
          "لا اسم، لا وجه، فقط طيفك ونبضك"
        </motion.p>
      </div>
    </div>
  );
}
