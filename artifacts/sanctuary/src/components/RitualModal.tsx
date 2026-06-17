import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPECTRAL_COLORS = [
  { hex: "#C4B5FD", name: "لافندر الفجر" },
  { hex: "#FDE047", name: "ذهب الأمل" },
  { hex: "#FCA5A5", name: "جمر دافئ" },
  { hex: "#2DD4BF", name: "فيروز الكون" },
  { hex: "#93C5FD", name: "أزرق العمق" },
  { hex: "#F472B6", name: "وردي الروح" },
  { hex: "#86EFAC", name: "أخضر النجاة" },
  { hex: "#FB923C", name: "برتقال الحرية" },
  { hex: "#818CF8", name: "بنفسجي الفكر" },
  { hex: "#34D399", name: "أخضر الأصداء" },
  { hex: "#60A5FA", name: "سماء الصدى" },
  { hex: "#A78BFA", name: "خزامى الغموض" },
];

export function RitualModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [color, setColor] = useState(SPECTRAL_COLORS[0]);
  const [thought, setThought] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("spectralColor");
    if (!stored) {
      setTimeout(() => setIsOpen(true), 400);
    }
  }, []);

  const completeRitual = () => {
    localStorage.setItem("spectralColor", color.hex);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "rgba(6, 8, 14, 0.97)", backdropFilter: "blur(40px)" }}
      >
        {/* Animated stars behind modal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-twinkle"
              style={{
                width: Math.random() * 2 + 0.5 + "px",
                height: Math.random() * 2 + 0.5 + "px",
                background: color.hex,
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animationDuration: Math.random() * 4 + 2 + "s",
                animationDelay: Math.random() * 3 + "s",
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
          {/* Central glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 animate-slow-breathe"
            style={{ background: `radial-gradient(circle, ${color.hex}, transparent)` }}
          />
        </div>

        <motion.div
          className="relative w-full max-w-md overflow-hidden"
          style={{
            background: "rgba(11, 14, 20, 0.85)",
            border: `1px solid ${color.hex}25`,
            borderRadius: "1.5rem",
            boxShadow: `0 0 80px -20px ${color.hex}40`,
          }}
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.1 }}
        >
          {/* Step indicator */}
          <div className="flex gap-1.5 justify-center pt-6 pb-0 px-6">
            {[1, 2].map(s => (
              <div
                key={s}
                className="rounded-full transition-all duration-500"
                style={{
                  width: step === s ? "24px" : "6px",
                  height: "4px",
                  background: step === s ? color.hex : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8 flex flex-col items-center text-center gap-6"
              >
                {/* Central orb */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${color.hex}80, ${color.hex}15)`,
                    boxShadow: `0 0 40px -8px ${color.hex}`,
                  }}
                />

                <div>
                  <h2 className="text-2xl font-light tracking-widest text-white mb-2">
                    طقس المرآة الأولى
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    لا اسم. لا وجه. فقط طيفك — لونك في الكون المجهول.
                  </p>
                </div>

                <div className="w-full">
                  <p className="text-white/50 text-xs mb-4 tracking-widest">اختر لون طيفك:</p>
                  <div className="grid grid-cols-6 gap-2.5">
                    {SPECTRAL_COLORS.map(c => (
                      <motion.button
                        key={c.hex}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setColor(c)}
                        className="relative"
                        title={c.name}
                      >
                        <motion.div
                          animate={{
                            scale: color.hex === c.hex ? 1.2 : 1,
                            boxShadow: color.hex === c.hex ? `0 0 16px -2px ${c.hex}` : "none",
                          }}
                          className="w-9 h-9 rounded-full mx-auto"
                          style={{ background: c.hex }}
                        />
                        {color.hex === c.hex && (
                          <motion.div
                            layoutId="color-ring"
                            className="absolute inset-0 rounded-full border-2 border-white/60 scale-125"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <motion.p
                    key={color.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs mt-3 tracking-widest"
                    style={{ color: color.hex }}
                  >
                    {color.name}
                  </motion.p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-full font-light text-sm transition-all duration-300"
                  style={{
                    background: `${color.hex}20`,
                    border: `1px solid ${color.hex}50`,
                    color: color.hex,
                    boxShadow: `0 0 20px -8px ${color.hex}`,
                  }}
                >
                  المضي قدماً →
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8 flex flex-col items-center text-center gap-6"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-3xl"
                  style={{ color: color.hex }}
                >
                  ◎
                </motion.div>

                <div>
                  <h2 className="text-xl font-light tracking-widest text-white mb-2">نبضة البداية</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    اترك شيئاً في الفراغ الكوني قبل الدخول. فكرة، خوف، أمنية، أو مجرد تنهيدة.
                  </p>
                </div>

                <div className="w-full relative">
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl opacity-10 pointer-events-none"
                    style={{ background: color.hex }}
                  />
                  <textarea
                    value={thought}
                    onChange={e => setThought(e.target.value)}
                    placeholder="أنا هنا لأنني..."
                    className="relative w-full h-28 bg-black/50 border rounded-2xl p-4 text-white/90 placeholder:text-white/20 focus:outline-none resize-none text-sm leading-relaxed transition-colors"
                    style={{
                      borderColor: thought ? `${color.hex}40` : "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>

                <div className="w-full flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="py-3 px-5 rounded-full border border-white/10 text-white/30 text-sm hover:text-white/60 transition-colors"
                  >
                    ←
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={completeRitual}
                    disabled={!thought.trim()}
                    className="flex-1 py-3.5 rounded-full font-medium text-sm transition-all disabled:opacity-30"
                    style={{
                      background: color.hex,
                      color: "#0B0E14",
                      boxShadow: thought.trim() ? `0 0 30px -6px ${color.hex}` : "none",
                    }}
                  >
                    دخول الملاذ
                  </motion.button>
                </div>

                <p className="text-white/15 text-[10px] tracking-widest">
                  نبضتك تبقى في الكون — لا أحد يقرأها
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
