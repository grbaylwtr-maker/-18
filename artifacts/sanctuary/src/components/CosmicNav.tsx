import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const LINKS = [
  { href: "/",           glyph: "⌂",  label: "البهو الكوني",       color: "#C4B5FD" },
  { href: "/echo",       glyph: "◎",  label: "الصدى",              color: "#60A5FA" },
  { href: "/galaxy",     glyph: "✦",  label: "المجرة",             color: "#FDE047" },
  { href: "/mirrors",    glyph: "▣",  label: "المرايا",            color: "#A78BFA" },
  { href: "/music",      glyph: "♫",  label: "الأصداء الموسيقية",  color: "#34D399" },
  { href: "/tales",      glyph: "✿",  label: "الحكايات",           color: "#FBBF24" },
  { href: "/mystery",    glyph: "⬡",  label: "الغموض",             color: "#C084FC" },
  { href: "/freedom",    glyph: "⊕",  label: "الحرية",             color: "#FCD34D" },
  { href: "/kindred",    glyph: "⋈",  label: "الأطياف المتشابهة",  color: "#F472B6" },
  { href: "/simplicity", glyph: "○",  label: "البساطة",            color: "#93C5FD" },
  { href: "/complexity", glyph: "◈",  label: "التعقيد",            color: "#818CF8" },
  { href: "/expression", glyph: "⬟",  label: "التعبير الحر",       color: "#FB923C" },
  { href: "/sanctuary",  glyph: "♡",  label: "الملاذ الأخير",      color: "#FCA5A5" },
  { href: "/search",     glyph: "◌",  label: "البحث الكوني",       color: "#67E8F9" },
  { href: "/mood",       glyph: "◉",  label: "يوميات الطيف",       color: "#86EFAC" },
  { href: "/cosmos",     glyph: "⊛",  label: "كوني الخاص",         color: "#D8B4FE" },
];

export function CosmicNav() {
  const [location] = useLocation();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.nav
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 right-0 h-screen hidden md:flex flex-col items-center py-4 gap-0.5 z-50"
        style={{
          background: "linear-gradient(to left, rgba(11,14,20,0.95), rgba(11,14,20,0.7))",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.04)",
          width: collapsed ? "56px" : "180px",
          transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        {/* Spectral color dot */}
        <div className="mb-4 mt-2">
          <div
            className="w-5 h-5 rounded-full animate-breathe"
            style={{
              background: localStorage.getItem("spectralColor") ?? "#C4B5FD",
              boxShadow: `0 0 12px ${localStorage.getItem("spectralColor") ?? "#C4B5FD"}80`,
            }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto no-scrollbar w-full px-2">
          {LINKS.map(link => {
            const isActive = location === link.href;
            const isHov = hoveredHref === link.href;

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  onMouseEnter={() => setHoveredHref(link.href)}
                  onMouseLeave={() => setHoveredHref(null)}
                  className="relative flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer overflow-hidden transition-all duration-300"
                  style={{
                    background: isActive
                      ? `${link.color}15`
                      : isHov ? "rgba(255,255,255,0.04)" : "transparent",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                      style={{ background: link.color }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <motion.span
                    animate={{
                      color: isActive ? link.color : isHov ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                      textShadow: isActive ? `0 0 12px ${link.color}` : "none",
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-lg flex-shrink-0 w-6 text-center"
                  >
                    {link.glyph}
                  </motion.span>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs whitespace-nowrap"
                        style={{ color: isActive ? link.color : "rgba(255,255,255,0.5)" }}
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Version */}
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/10 text-[9px] tracking-widest mb-2"
            >
              SPECTRAL v0.15
            </motion.p>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile bottom bar */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 md:hidden z-50 flex items-center justify-around px-2 py-2"
        style={{
          background: "rgba(11,14,20,0.92)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Show first 7 items + overflow */}
        {LINKS.slice(0, 7).map(link => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative flex flex-col items-center gap-0.5 p-2 rounded-xl"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `${link.color}15` }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className="text-lg z-10"
                  style={{
                    color: isActive ? link.color : "rgba(255,255,255,0.3)",
                    filter: isActive ? `drop-shadow(0 0 6px ${link.color})` : "none",
                    transition: "color 0.2s, filter 0.2s",
                  }}
                >
                  {link.glyph}
                </span>
                <span
                  className="text-[9px] z-10"
                  style={{ color: isActive ? link.color : "rgba(255,255,255,0.2)" }}
                >
                  {link.label.split(" ")[0]}
                </span>
              </motion.div>
            </Link>
          );
        })}

        {/* More button */}
        <Link href="/galaxy">
          <motion.div
            whileTap={{ scale: 0.85 }}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl"
          >
            <span className="text-lg text-white/20">⋯</span>
            <span className="text-[9px] text-white/20">المزيد</span>
          </motion.div>
        </Link>
      </motion.nav>
    </>
  );
}
