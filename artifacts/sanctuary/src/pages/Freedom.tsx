import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CosmicBackground } from "../components/CosmicBackground";

const THREADS = [
  { id: 1, topic: "الإلحاد واللادينية", posts: 284, color: "#FDE047", hot: true,
    preview: "لست ملحداً لأنني أكره الدين، بل لأن العقل أوصلني إلى هنا. هذا قرار صعب وشجاع." },
  { id: 2, topic: "العلاقات المفتوحة", posts: 167, color: "#FB923C", hot: true,
    preview: "الغيرة مشاعر مُعلَّمة، ليست طبيعة. أنا أحب شريكي ولا أشعر بالغيرة — وهذا شيء جميل." },
  { id: 3, topic: "تعدد الشركاء (Polyamory)", posts: 93, color: "#F472B6", hot: false,
    preview: "تعلمت أن الحب ليس موردا محدودا. يمكنني أن أحب أكثر من شخص وكلاهما يعلم ذلك." },
  { id: 4, topic: "رفض الزواج التقليدي", posts: 142, color: "#2DD4BF", hot: false,
    preview: "اخترت أن أعيش مع شريكتي دون زواج رسمي. ليس لأنني لا أحبها، بل لأن ورقة لا تعني شيئاً." },
  { id: 5, topic: "الروحانية بلا دين", posts: 78, color: "#C4B5FD", hot: false,
    preview: "أؤمن بشيء ما — لا أسميه إلهاً ولا ألحد به. مساحة الشك والتأمل هي منزلي الروحي." },
  { id: 6, topic: "من يسميهم المجتمع ديوثاً", posts: 52, color: "#86EFAC", hot: true,
    preview: "المجتمع أطلق علينا هذا اللقب لأننا نرفض الغيرة المسمومة ونؤمن بالثقة المطلقة." },
  { id: 7, topic: "العيش بمفردك باختيار", posts: 119, color: "#818CF8", hot: false,
    preview: "أختار الوحدة لأنها حرية، لا لأنني عاجز عن الارتباط. فرق كبير لا يفهمه كثيرون." },
  { id: 8, topic: "نقد التقاليد الاجتماعية", posts: 203, color: "#FCA5A5", hot: true,
    preview: "ليس كل ما ورثناه صحيحاً. التساؤل عن الموروث شجاعة، لا كفر." },
];

export function Freedom() {
  const [active, setActive] = useState<number | null>(null);
  const [composed, setComposed] = useState("");
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());

  const activeThread = THREADS.find(t => t.id === active);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor={activeThread?.color ?? "#FDE047"}
        nebulaColor2="#1A1200"
        intensity={0.85}
        shootingStars
      />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-4xl block mb-3 animate-breathe" style={{ color: activeThread?.color ?? "#FDE047" }}>⊕</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-1 text-yellow-200">الحرية</h1>
          <p className="text-white/40 text-sm tracking-widest mb-3">Freedom Dimension</p>
          <p className="text-white/25 text-xs max-w-sm mx-auto leading-relaxed">
            أفكار تحررية، علاقات غير تقليدية، فلسفات بديلة — بلا حكم ولا قيود
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {THREADS.map((thread, i) => {
            const isActive = active === thread.id;
            const isDone = submitted.has(thread.id);

            return (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border cursor-pointer transition-all duration-400 overflow-hidden"
                style={{
                  borderColor: isActive ? thread.color : "rgba(255,255,255,0.07)",
                  background: isActive ? `${thread.color}0C` : "rgba(255,255,255,0.03)",
                  boxShadow: isActive ? `0 0 40px -12px ${thread.color}` : "none",
                }}
                onClick={() => setActive(a => a === thread.id ? null : thread.id)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-cosmic-pulse" style={{ background: thread.color }} />
                      {thread.hot && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-orange-400/30 text-orange-400/70 bg-orange-400/5">
                          ساخن
                        </span>
                      )}
                    </div>
                    <span className="text-white/20 text-[10px]">{thread.posts} منشور</span>
                  </div>

                  <h3 className="font-medium text-sm mb-2 leading-snug"
                    style={{ color: isActive ? thread.color : "rgba(255,255,255,0.85)" }}>
                    {thread.topic}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{thread.preview}</p>
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 overflow-hidden"
                    >
                      <div className="p-5">
                        {!isDone ? (
                          <>
                            <textarea
                              value={composed}
                              onChange={e => setComposed(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              placeholder="شاركهم فكرتك أو تجربتك..."
                              className="w-full h-20 bg-black/30 border border-white/10 rounded-xl p-3 text-white/80 placeholder:text-white/20 resize-none text-xs focus:outline-none transition-colors mb-3"
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-white/20 text-[10px]">يُنشر بطيفك فقط</span>
                              <button
                                disabled={!composed.trim()}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSubmitted(s => new Set([...s, thread.id]));
                                  setComposed("");
                                }}
                                className="px-5 py-1.5 rounded-full text-xs transition-all disabled:opacity-30"
                                style={{ background: thread.color, color: "#0B0E14" }}
                              >
                                شارك
                              </button>
                            </div>
                          </>
                        ) : (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-xs py-2"
                            style={{ color: thread.color }}
                          >
                            ✓ انطلقت فكرتك في الفضاء الحر
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 text-white/15 text-xs tracking-widest italic"
        >
          "الحرية ليست غياب القيود فحسب — بل وجود من يفهم حريتك"
        </motion.p>
      </div>
    </div>
  );
}
