import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetRecentActivity } from "@workspace/api-client-react";
import { useLocation } from "wouter";

const TYPE_ICONS: Record<string, string> = {
  comment: "✿",
  expression: "⬟",
  galaxy_message: "✦",
  tale_pulse: "◎",
  expression_resonance: "◌",
};

const LAST_SEEN_KEY = "sanctuary_notif_last_seen";

function getLastSeen(): string {
  return localStorage.getItem(LAST_SEEN_KEY) ?? new Date(Date.now() - 60 * 1000).toISOString();
}

function markSeen() {
  localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
}

export function useCosmicActivity() {
  const [since, setSince] = useState(getLastSeen);
  const [unseenCount, setUnseenCount] = useState(0);

  const { data, refetch } = useGetRecentActivity({ since });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30_000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (data?.events) {
      const count = data.events.filter(
        e => new Date(e.timestamp) > new Date(since)
      ).length;
      setUnseenCount(count);
    }
  }, [data, since]);

  const markAllSeen = useCallback(() => {
    markSeen();
    setSince(new Date().toISOString());
    setUnseenCount(0);
  }, []);

  return { events: data?.events ?? [], unseenCount, markAllSeen, refetch };
}

interface CosmicNotificationsProps {
  events: Array<{ id: string; type: string; label: string; color: string; href: string; timestamp: string }>;
  unseenCount: number;
  onMarkSeen: () => void;
}

export function CosmicNotificationBell({ events, unseenCount, onMarkSeen }: CosmicNotificationsProps) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) onMarkSeen();
  };

  const handleNav = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60_000) return "الآن";
    if (diff < 3_600_000) return `منذ ${Math.floor(diff / 60_000)} دقيقة`;
    if (diff < 86_400_000) return `منذ ${Math.floor(diff / 3_600_000)} ساعة`;
    return `منذ ${Math.floor(diff / 86_400_000)} يوم`;
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300"
        style={{
          background: open ? "rgba(196,181,253,0.12)" : "transparent",
        }}
        title="الإشعارات الكونية"
      >
        <motion.span
          animate={{
            color: unseenCount > 0 ? "#C4B5FD" : "rgba(255,255,255,0.35)",
            textShadow: unseenCount > 0 ? "0 0 14px #C4B5FD" : "none",
          }}
          transition={{ duration: 0.4 }}
          className="text-lg"
        >
          ◈
        </motion.span>

        {/* Unseen badge */}
        <AnimatePresence>
          {unseenCount > 0 && (
            <motion.div
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
              style={{ background: "#C4B5FD", color: "#0B0E14" }}
            >
              {unseenCount > 9 ? "9+" : unseenCount}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outer cosmic pulse ring when there are new events */}
        <AnimatePresence>
          {unseenCount > 0 && (
            <motion.div
              key="ring"
              className="absolute inset-0 rounded-xl border"
              style={{ borderColor: "#C4B5FD40" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </button>

      {/* Notification panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute left-0 top-11 w-72 rounded-2xl border z-[200] overflow-hidden"
            style={{
              background: "rgba(11,14,20,0.97)",
              backdropFilter: "blur(32px)",
              borderColor: "rgba(196,181,253,0.15)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 40px rgba(196,181,253,0.05)",
              direction: "rtl",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: "#C4B5FD" }}>◈</span>
                <span className="text-xs font-medium tracking-widest text-white/60">
                  النبضات الكونية
                </span>
              </div>
              <span className="text-[10px] text-white/25">آخر ٥ دقائق</span>
            </div>

            {/* Events list */}
            <div className="max-h-72 overflow-y-auto no-scrollbar">
              {events.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-2xl mb-2 opacity-30">◌</div>
                  <p className="text-white/25 text-xs">الكون هادئ الآن</p>
                </div>
              ) : (
                <div className="py-1">
                  {events.map((event, i) => (
                    <motion.button
                      key={event.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleNav(event.href)}
                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/[0.03] transition-colors text-right"
                    >
                      {/* Color dot + icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                          style={{
                            background: `${event.color}15`,
                            border: `1px solid ${event.color}30`,
                            color: event.color,
                            filter: `drop-shadow(0 0 6px ${event.color}40)`,
                          }}
                        >
                          {TYPE_ICONS[event.type] ?? "◎"}
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/75 leading-relaxed line-clamp-2">
                          {event.label}
                        </p>
                        <p className="text-[10px] text-white/25 mt-1">
                          {relativeTime(event.timestamp)}
                        </p>
                      </div>

                      {/* Color accent bar */}
                      <div
                        className="flex-shrink-0 w-0.5 h-full self-stretch rounded-full mt-0.5"
                        style={{ background: `${event.color}50`, minHeight: "28px" }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {events.length > 0 && (
              <div
                className="px-4 py-2 border-t text-center"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <span className="text-[10px] text-white/20 tracking-widest">
                  {events.length} حدث كوني حديث
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
