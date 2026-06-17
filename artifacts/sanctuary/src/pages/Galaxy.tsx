import { useListGalaxies } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { CosmicBackground } from "../components/CosmicBackground";

const CATEGORY_LABELS: Record<string, { ar: string; color: string }> = {
  emotional:    { ar: "مشاعر",    color: "#FCA5A5" },
  freedom:      { ar: "حرية",     color: "#FDE047" },
  kindred:      { ar: "أطياف",    color: "#F472B6" },
  "mental-health": { ar: "صحة نفسية", color: "#818CF8" },
  complexity:   { ar: "فكر",      color: "#60A5FA" },
  lifestyle:    { ar: "أسلوب حياة", color: "#2DD4BF" },
  identity:     { ar: "هوية",     color: "#C084FC" },
  relationships:{ ar: "علاقات",   color: "#FB923C" },
};

const FILTER_OPTIONS = [
  { id: "all",      ar: "الكل" },
  { id: "emotional",ar: "مشاعر" },
  { id: "freedom",  ar: "حرية" },
  { id: "kindred",  ar: "أطياف" },
  { id: "mental-health", ar: "صحة نفسية" },
  { id: "lifestyle",ar: "أسلوب حياة" },
  { id: "identity", ar: "هوية" },
  { id: "relationships", ar: "علاقات" },
];

export function Galaxy() {
  const { data: galaxies, isLoading } = useListGalaxies();
  const [filter, setFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = filter === "all"
    ? galaxies ?? []
    : (galaxies ?? []).filter(g => g.category === filter);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground
        nebulaColor="#FDE047"
        nebulaColor2="#7C3AED"
        intensity={0.8}
        shootingStars
      />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-4xl block mb-3" style={{ color: "#FDE047", filter: "drop-shadow(0 0 20px #FDE04780)" }}>✦</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest mb-1 text-yellow-200">
            بُعد المجرة
          </h1>
          <p className="text-white/40 text-sm tracking-widest mb-2">Galaxy Dimension</p>
          <p className="text-white/25 text-xs max-w-md mx-auto leading-relaxed">
            مساحات جماعية مؤقتة — تجمع الأطياف المتشابهة بلا أسماء
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className="px-3 py-1.5 rounded-full text-xs border transition-all duration-300"
              style={{
                borderColor: filter === opt.id ? "#FDE047" : "rgba(255,255,255,0.1)",
                background: filter === opt.id ? "#FDE04715" : "transparent",
                color: filter === opt.id ? "#FDE047" : "rgba(255,255,255,0.4)",
              }}
            >
              {opt.ar}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-16 h-16 rounded-full border border-yellow-300/20 border-t-yellow-300 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((galaxy, i) => {
                const cat = CATEGORY_LABELS[galaxy.category ?? ""] ?? { ar: galaxy.category ?? "", color: "#C4B5FD" };
                const isHov = hoveredId === galaxy.id;

                return (
                  <Link key={galaxy.id} href={`/galaxy/${galaxy.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 120 }}
                      onMouseEnter={() => setHoveredId(galaxy.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="relative p-5 rounded-2xl border cursor-pointer transition-all duration-400 group overflow-hidden"
                      style={{
                        borderColor: isHov ? galaxy.color : "rgba(255,255,255,0.07)",
                        background: isHov ? `${galaxy.color}0C` : "rgba(255,255,255,0.03)",
                        boxShadow: isHov ? `0 0 40px -12px ${galaxy.color}` : "none",
                      }}
                    >
                      {/* Star cluster decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none overflow-hidden">
                        {Array.from({ length: 12 }).map((_, j) => (
                          <div
                            key={j}
                            className="absolute rounded-full animate-twinkle"
                            style={{
                              width: Math.random() * 2 + 1 + "px",
                              height: Math.random() * 2 + 1 + "px",
                              background: galaxy.color,
                              top: Math.random() * 100 + "%",
                              left: Math.random() * 100 + "%",
                              animationDuration: Math.random() * 3 + 2 + "s",
                              animationDelay: Math.random() * 2 + "s",
                              opacity: Math.random() * 0.6 + 0.1,
                            }}
                          />
                        ))}
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          {/* Nebula orb */}
                          <motion.div
                            animate={{ scale: isHov ? 1.2 : 1 }}
                            transition={{ duration: 0.4 }}
                            className="w-12 h-12 rounded-full animate-slow-breathe flex-shrink-0"
                            style={{
                              background: `radial-gradient(circle at 30% 30%, ${galaxy.color}90, ${galaxy.color}20)`,
                              boxShadow: isHov ? `0 0 20px -4px ${galaxy.color}` : "none",
                            }}
                          />
                          <span
                            className="text-[10px] px-2 py-1 rounded-full border"
                            style={{
                              color: cat.color,
                              borderColor: `${cat.color}30`,
                              background: `${cat.color}10`,
                            }}
                          >
                            {cat.ar}
                          </span>
                        </div>

                        <h3 className="font-medium text-base mb-2 leading-snug"
                          style={{ color: isHov ? galaxy.color : "rgba(255,255,255,0.9)" }}>
                          {galaxy.name}
                        </h3>

                        <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-4">
                          {galaxy.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-white/30 text-[10px]">
                              {(galaxy.memberCount ?? 0).toLocaleString()} طيف
                            </span>
                          </div>

                          {galaxy.isLive && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full border border-green-400/30 text-green-400/70 bg-green-400/5">
                              مباشر
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24 text-white/20 text-sm">
            لا توجد مجرات في هذا التصنيف بعد
          </div>
        )}
      </div>
    </div>
  );
}
