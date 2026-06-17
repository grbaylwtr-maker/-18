import { useSearchContent } from "@workspace/api-client-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "../components/CosmicBackground";
import { Link } from "wouter";

export function Search() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [dim, setDim] = useState<string | undefined>(undefined);

  const { data, isLoading } = useSearchContent({ q: submitted, dimension: dim });

  const handleSearch = () => {
    if (query.trim().length >= 2) setSubmitted(query.trim());
  };

  const totalFound = data?.total ?? 0;
  const tales = data?.tales ?? [];
  const galaxies = data?.galaxies ?? [];
  const expressions = data?.expressions ?? [];

  const DIMS = [
    { id: undefined as string | undefined, ar: "الكل", glyph: "◎" },
    { id: "tales" as string, ar: "الحكايات", glyph: "✿" },
    { id: "galaxy" as string, ar: "المجرة", glyph: "✦" },
    { id: "expression" as string, ar: "التعبير", glyph: "⬟" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground nebulaColor="#60A5FA" nebulaColor2="#0B0E14" intensity={0.6} shootingStars={false} />

      <div className="relative z-10 px-4 pt-10 pb-32 md:pb-12 md:pr-24 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-4xl block mb-3 animate-breathe text-blue-400">◎</span>
          <h1 className="text-4xl font-light tracking-widest mb-1 text-blue-300">البحث الكوني</h1>
          <p className="text-white/30 text-xs tracking-widest">ابحث في كل الأبعاد</p>
        </motion.div>

        {/* Search input */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ابحث عن حكاية، مجرة، أو تعبير..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-blue-400/50 transition-colors"
              dir="rtl"
            />
            <button
              onClick={handleSearch}
              className="px-5 py-3 rounded-xl border border-blue-400/30 bg-blue-400/10 text-blue-300 text-sm hover:bg-blue-400/20 transition-all"
            >
              ◎
            </button>
          </div>

          {/* Dimension filter */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {DIMS.map((d) => (
              <button
                key={d.ar}
                onClick={() => setDim(d.id)}
                className="px-3 py-1.5 rounded-full text-xs border transition-all duration-300"
                style={{
                  borderColor: dim === d.id ? "#60A5FA" : "rgba(255,255,255,0.1)",
                  background: dim === d.id ? "#60A5FA20" : "transparent",
                  color: dim === d.id ? "#60A5FA" : "rgba(255,255,255,0.4)",
                }}
              >
                {d.glyph} {d.ar}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <div className="w-8 h-8 rounded-full border border-blue-400/40 border-t-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-white/30 text-xs">يبحث في الكون...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {submitted && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-white/30 text-xs mb-6 text-center">
              {totalFound > 0 ? `${totalFound} نتيجة لـ "${submitted}"` : `لا نتائج لـ "${submitted}"`}
            </p>

            {/* Tales results */}
            {tales.length > 0 && (
              <section className="mb-8">
                <p className="text-yellow-300/60 text-xs tracking-widest mb-3 flex items-center gap-2">
                  <span>✿</span> الحكايات ({tales.length})
                </p>
                <div className="space-y-3">
                  {tales.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/6 transition-all"
                    >
                      <p className="text-yellow-200 text-sm font-medium mb-1">{t.title}</p>
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{t.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-white/20 text-[10px]">{t.genre}</span>
                        <span className="text-white/20 text-[10px]">◉ {t.pulseCount}</span>
                        {(t.commentCount ?? 0) > 0 && <span className="text-white/20 text-[10px]">◌ {t.commentCount}</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Galaxies results */}
            {galaxies.length > 0 && (
              <section className="mb-8">
                <p className="text-yellow-400/60 text-xs tracking-widest mb-3 flex items-center gap-2">
                  <span>✦</span> المجرات ({galaxies.length})
                </p>
                <div className="space-y-3">
                  {galaxies.map((g, i) => (
                    <Link key={g.id} href={`/galaxy/${g.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl border bg-white/3 hover:bg-white/6 transition-all cursor-pointer"
                        style={{ borderColor: `${g.color}30` }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: g.color }} />
                          <p className="text-sm font-medium" style={{ color: g.color }}>{g.name}</p>
                        </div>
                        <p className="text-white/40 text-xs">{g.description}</p>
                        <p className="text-white/20 text-[10px] mt-2">{g.memberCount} طيف · {g.category}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Expressions results */}
            {expressions.length > 0 && (
              <section className="mb-8">
                <p className="text-orange-400/60 text-xs tracking-widest mb-3 flex items-center gap-2">
                  <span>⬟</span> التعبير الحر ({expressions.length})
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {expressions.map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-2xl border"
                      style={{ borderColor: `${e.color}30`, background: `${e.color}08` }}
                    >
                      <p className="text-xs font-medium mb-1" style={{ color: e.color }}>{e.title}</p>
                      <p className="text-white/30 text-[10px]">{(e.description ?? "").slice(0, 60)}</p>
                      <p className="text-white/20 text-[10px] mt-2">♡ {e.resonanceCount}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}

        {!submitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} className="text-center py-16">
            <p className="text-white/15 text-xs tracking-widest leading-loose">
              الكون يحتوي على حكايات، مجرات، وتعبيرات
              <br />
              ابحث عما يشبهك
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
