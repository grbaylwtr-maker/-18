import { motion } from "framer-motion";
import { useState } from "react";
import { CosmicBackground } from "../components/CosmicBackground";

const SPECTRUMS = [
  {
    id: "queer",
    ar: "مجتمع الميم",
    en: "LGBTQ+",
    color: "#F472B6",
    members: 2847,
    desc: "المثليون، المثليات، مزدوجو الميول، العابرون جنسياً، اللاجنسيون — كل أطياف الطيف",
    glyph: "⋈",
  },
  {
    id: "polyamory",
    ar: "الحب الحر",
    en: "Polyamory",
    color: "#FB923C",
    members: 934,
    desc: "تعدد الشركاء، العلاقات المفتوحة، الزواج المفتوح — من يحبون بلا حدود",
    glyph: "♡",
  },
  {
    id: "nonreligious",
    ar: "بلا دين",
    en: "Non-Religious",
    color: "#FDE047",
    members: 1203,
    desc: "الملحدون، اللادينيون، الربوبيون، اللاأدريون — من يفكرون بحرية",
    glyph: "◎",
  },
  {
    id: "mentalhealth",
    ar: "المقاومون بصمت",
    en: "Mental Health",
    color: "#818CF8",
    members: 3421,
    desc: "من يعيشون مع الاكتئاب، القلق، والاضطرابات النفسية — لسنا وحدنا",
    glyph: "◈",
  },
  {
    id: "survivors",
    ar: "الناجون",
    en: "Survivors",
    color: "#86EFAC",
    members: 1876,
    desc: "الناجون من العنف الأسري والمجتمعي — القوة التي لا تُرى",
    glyph: "✦",
  },
  {
    id: "different",
    ar: "المختلفون",
    en: "The Different",
    color: "#2DD4BF",
    members: 4102,
    desc: "كل من يشعر أنه لا ينتمي، يخفي حقيقته، أو يبحث عن ملاذ",
    glyph: "○",
  },
  {
    id: "nonconformist",
    ar: "رافضو القيود",
    en: "Non-Conformists",
    color: "#C4B5FD",
    members: 1567,
    desc: "من يرفضون الحياة التقليدية، يختارون مساراتهم بأنفسهم",
    glyph: "⊕",
  },
  {
    id: "asexual",
    ar: "اللاجنسيون",
    en: "Asexual/Aromantic",
    color: "#A5B4FC",
    members: 623,
    desc: "من لا يشعرون بانجذاب جنسي أو رومانسي — هويتهم حقيقية ومشروعة",
    glyph: "⬡",
  },
  {
    id: "kinky",
    ar: "الميول المختلفة",
    en: "Alternative Lifestyles",
    color: "#F9A8D4",
    members: 445,
    desc: "كل الميول الجنسية غير التقليدية — بلا حكم، بلا خجل",
    glyph: "⬟",
  },
];

export function Kindred() {
  const [selected, setSelected] = useState<string | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const selectedSpec = SPECTRUMS.find(s => s.id === selected);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor={selectedSpec?.color ?? "#F472B6"}
        nebulaColor2="#1E1B4B"
        intensity={0.9}
        shootingStars
      />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-4xl block mb-3 animate-breathe" style={{ color: selectedSpec?.color ?? "#F472B6" }}>⋈</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-2"
            style={{ color: selectedSpec?.color ?? "#F472B6" }}>
            الأطياف المتشابهة
          </h1>
          <p className="text-white/40 text-sm tracking-widest mb-2">Kindred Spectrums</p>
          <p className="text-white/30 text-xs max-w-md mx-auto leading-relaxed">
            اعثر على من يشاركونك نفس الهوية والتجربة. لا أحكام، لا قيود.
          </p>
        </motion.div>

        {/* Spectrum clusters */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {SPECTRUMS.map((spec, i) => {
            const isSelected = selected === spec.id;
            const isJoined = joined.has(spec.id);

            return (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 100 }}
                onClick={() => setSelected(isSelected ? null : spec.id)}
                className="relative cursor-pointer p-5 rounded-2xl border transition-all duration-400"
                style={{
                  borderColor: isSelected ? spec.color : "rgba(255,255,255,0.07)",
                  background: isSelected ? `${spec.color}10` : "rgba(255,255,255,0.03)",
                  boxShadow: isSelected ? `0 0 40px -10px ${spec.color}` : "none",
                }}
              >
                {/* Star cluster visualization */}
                <div className="relative h-16 mb-4 overflow-hidden">
                  {Array.from({ length: 20 }).map((_, j) => (
                    <div
                      key={j}
                      className="absolute rounded-full animate-twinkle"
                      style={{
                        width: Math.random() * 4 + 1 + "px",
                        height: Math.random() * 4 + 1 + "px",
                        background: spec.color,
                        top: Math.random() * 100 + "%",
                        left: Math.random() * 100 + "%",
                        animationDuration: Math.random() * 3 + 2 + "s",
                        animationDelay: Math.random() * 2 + "s",
                        opacity: Math.random() * 0.8 + 0.2,
                      }}
                    />
                  ))}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl"
                    style={{ color: spec.color, filter: `drop-shadow(0 0 8px ${spec.color})` }}
                  >
                    {spec.glyph}
                  </div>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-base mb-0.5" style={{ color: isSelected ? spec.color : "rgba(255,255,255,0.85)" }}>
                      {spec.ar}
                    </h3>
                    <p className="text-white/30 text-[11px] tracking-widest">{spec.en}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: spec.color }}>{spec.members.toLocaleString()}</p>
                    <p className="text-white/20 text-[10px]">طيف</p>
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-white/50 text-xs leading-relaxed mb-4">{spec.desc}</p>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setJoined(s => {
                          const n = new Set(s);
                          if (n.has(spec.id)) n.delete(spec.id); else n.add(spec.id);
                          return n;
                        });
                      }}
                      className="w-full py-2 rounded-xl text-xs font-medium transition-all duration-300"
                      style={{
                        background: isJoined ? `${spec.color}30` : spec.color,
                        color: isJoined ? spec.color : "#0B0E14",
                        border: isJoined ? `1px solid ${spec.color}` : "none",
                      }}
                    >
                      {isJoined ? "✓ أنت معنا" : "انضم إلى هذا الطيف"}
                    </button>
                  </motion.div>
                )}

                {/* Live indicator */}
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/20 text-[10px]">
                    {Math.floor(spec.members * 0.08)} متصل الآن
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Anonymous pledge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10"
        >
          <p className="text-white/15 text-xs tracking-widest italic">
            "هويتك محمية. لا أسماء، لا كشف، فقط طيفك وانتماؤك."
          </p>
        </motion.div>
      </div>
    </div>
  );
}
