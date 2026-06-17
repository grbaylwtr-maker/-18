import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CosmicBackground } from "../components/CosmicBackground";

const THREADS = [
  {
    id: 1, title: "هل الوعي وهم؟",
    body: "إذا كانت كل أفكارنا ناتجة عن تفاعلات كيميائية في الدماغ، فهل يوجد شيء اسمه 'الإرادة الحرة' أصلاً؟",
    replies: 47, depth: 5, color: "#818CF8", tags: ["فلسفة", "وعي", "حرية"],
  },
  {
    id: 2, title: "الأخلاق بلا دين — هل هي ممكنة؟",
    body: "كثيرون يقولون إن الأخلاق لا وجود لها بدون مرجعية دينية. لكن الواقع يقول غير ذلك. كيف تبني أخلاقك؟",
    replies: 92, depth: 8, color: "#60A5FA", tags: ["فلسفة", "دين", "أخلاق"],
  },
  {
    id: 3, title: "المجتمع كسجن مفتوح",
    body: "فوكو قال إن السلطة لا تحكمك بالقوة بل بجعلك تراقب نفسك. هل نحن محكومون بمجتمعنا بدون أن نشعر؟",
    replies: 34, depth: 4, color: "#C084FC", tags: ["فلسفة", "مجتمع", "سلطة"],
  },
  {
    id: 4, title: "الكون — ما قبل البداية",
    body: "ما الذي كان موجوداً قبل الانفجار الكبير؟ وهل السؤال نفسه منطقي إذا لم يكن الزمن موجوداً بعد؟",
    replies: 61, depth: 6, color: "#FDE047", tags: ["علم", "كون", "فلسفة"],
  },
  {
    id: 5, title: "نهاية الهوية في العصر الرقمي",
    body: "نصف حياتنا صار رقمياً. هل نحن نفسنا أونلاين؟ أم أننا نبني هويات موازية منفصلة؟",
    replies: 78, depth: 7, color: "#2DD4BF", tags: ["هوية", "تقنية", "مستقبل"],
  },
];

const NODE_POSITIONS = [
  { x: 50, y: 50 }, { x: 20, y: 25 }, { x: 80, y: 20 },
  { x: 15, y: 70 }, { x: 75, y: 75 }, { x: 50, y: 15 },
  { x: 30, y: 80 }, { x: 85, y: 50 }, { x: 45, y: 85 },
];

export function Complexity() {
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const [composed, setComposed] = useState("");

  const active = THREADS.find(t => t.id === activeThread);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor={active?.color ?? "#818CF8"}
        nebulaColor2="#0F0F1A"
        intensity={0.7}
        shootingStars={false}
      />

      <div className="relative z-10 flex min-h-screen md:pr-24">
        {/* Thread list */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-l border-white/5 overflow-y-auto no-scrollbar">
          <div className="p-6 border-b border-white/5">
            <span className="text-3xl block mb-2 animate-breathe" style={{ color: active?.color ?? "#818CF8" }}>◈</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-widest mb-1" style={{ color: active?.color ?? "#818CF8" }}>
              التعقيد
            </h1>
            <p className="text-white/30 text-xs tracking-widest">Complexity · أفكار بلا سقف</p>
          </div>

          <div className="flex-1 p-4 space-y-3">
            {THREADS.map((thread, i) => (
              <motion.button
                key={thread.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActiveThread(t => t === thread.id ? null : thread.id)}
                className="w-full text-right p-4 rounded-2xl border transition-all duration-300"
                style={{
                  borderColor: activeThread === thread.id ? thread.color : "rgba(255,255,255,0.07)",
                  background: activeThread === thread.id ? `${thread.color}10` : "rgba(255,255,255,0.03)",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex gap-1 flex-wrap">
                    {thread.tags.map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/10 text-white/30">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1 animate-cosmic-pulse"
                    style={{ background: thread.color }}
                  />
                </div>
                <h3 className="font-medium text-sm mb-1 text-white/90 leading-tight">{thread.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{thread.body}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-white/25">
                  <span>{thread.replies} رد</span>
                  <span>عمق {thread.depth}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Thread detail / network vis */}
        <div className="hidden md:flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="flex-1 flex flex-col p-8"
              >
                {/* Idea network */}
                <div className="relative h-56 mb-8 rounded-2xl overflow-hidden border border-white/5"
                  style={{ background: `${active.color}08` }}>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {NODE_POSITIONS.slice(0, active.depth).map((pos, i) => (
                      NODE_POSITIONS.slice(0, active.depth).slice(i + 1, i + 3).map((pos2, j) => (
                        <line key={`${i}-${j}`}
                          x1={pos.x} y1={pos.y} x2={pos2.x} y2={pos2.y}
                          stroke={active.color} strokeWidth="0.3" strokeOpacity="0.3" />
                      ))
                    ))}
                    {NODE_POSITIONS.slice(0, active.depth).map((pos, i) => (
                      <circle key={i} cx={pos.x} cy={pos.y} r={i === 0 ? 3 : 1.5}
                        fill={active.color} opacity={i === 0 ? 0.9 : 0.5} />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/10 text-xs tracking-widest">شبكة الأفكار</p>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap mb-4">
                  {active.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full border"
                      style={{ borderColor: `${active.color}40`, color: active.color, background: `${active.color}10` }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl font-medium mb-4" style={{ color: active.color }}>{active.title}</h2>
                <p className="text-white/70 leading-relaxed text-sm mb-6">{active.body}</p>

                <div className="flex items-center gap-4 text-xs text-white/30 mb-6 pb-6 border-b border-white/5">
                  <span>{active.replies} مشارك في النقاش</span>
                  <span>عمق التفكير: {active.depth}/10</span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    نقاش حي
                  </span>
                </div>

                <div className="mt-auto">
                  <textarea
                    value={composed}
                    onChange={e => setComposed(e.target.value)}
                    placeholder="فكرتك في هذا النقاش..."
                    className="w-full h-24 bg-white/3 border border-white/10 rounded-xl p-4 text-white/80 placeholder:text-white/20 resize-none text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-white/20 text-xs">يُنشر بطيفك فقط، بلا هوية</span>
                    <button
                      disabled={!composed.trim()}
                      className="px-6 py-2 rounded-full text-xs font-medium transition-all duration-300 disabled:opacity-30"
                      style={{ background: active.color, color: "#0B0E14" }}
                      onClick={() => setComposed("")}
                    >
                      أرسل الفكرة
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-4"
              >
                <div className="relative w-48 h-48">
                  {NODE_POSITIONS.map((pos, i) => (
                    <div key={i}
                      className="absolute rounded-full animate-twinkle"
                      style={{
                        width: i === 0 ? "12px" : "6px",
                        height: i === 0 ? "12px" : "6px",
                        background: "#818CF8",
                        top: pos.y + "%",
                        left: pos.x + "%",
                        animationDuration: `${2 + i * 0.5}s`,
                        animationDelay: `${i * 0.3}s`,
                        opacity: i === 0 ? 0.9 : 0.4,
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/20 text-sm tracking-widest text-center">
                  اختر خيطاً فكرياً للدخول إليه
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
