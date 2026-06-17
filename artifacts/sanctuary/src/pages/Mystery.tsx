import { useSendSecret, useReceiveSecret, getReceiveSecretQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "../components/CosmicBackground";

export function Mystery() {
  const [mode, setMode] = useState<"idle" | "write" | "read">("idle");
  const [secretContent, setSecretContent] = useState("");
  const [sent, setSent] = useState(false);
  const [receivedSecret, setReceivedSecret] = useState<string | null>(null);
  const [responded, setResponded] = useState(false);

  const sendSecret = useSendSecret();
  const receiveSecret = useReceiveSecret();
  const queryClient = useQueryClient();

  const handleSend = async () => {
    if (!secretContent.trim()) return;
    await sendSecret.mutateAsync({ data: { content: secretContent } });
    setSecretContent("");
    setSent(true);
    setTimeout(() => { setSent(false); setMode("idle"); }, 3000);
  };

  const handleReceive = () => {
    setMode("read");
    const res = receiveSecret.data;
    setReceivedSecret((res as { content?: string } | undefined)?.content ?? "لا توجد أسرار الآن. عد لاحقاً.");
    queryClient.invalidateQueries({ queryKey: getReceiveSecretQueryKey() });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <CosmicBackground nebulaColor="#C084FC" nebulaColor2="#0A0014" intensity={1} shootingStars />

      {/* Floating threads decoration */}
      <div className="absolute inset-0 pointer-events-none z-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px opacity-20"
            style={{
              left: `${10 + i * 11}%`,
              top: 0, bottom: 0,
              background: `linear-gradient(to bottom, transparent, #C084FC, transparent)`,
              animationDuration: `${4 + i * 0.7}s`,
            }}
            animate={{ opacity: [0.05, 0.25, 0.05] }}
            transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {/* Idle state */}
          {mode === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 mx-auto mb-8 rounded-full border border-purple-500/20"
                style={{ boxShadow: "0 0 40px -8px #C084FC40" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">⬡</span>
                </div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full animate-slow-breathe"
                style={{ background: "radial-gradient(circle, #C084FC20, transparent)" }} />

              <h1 className="text-4xl font-light tracking-widest mb-2 text-purple-300">الغموض</h1>
              <p className="text-white/40 text-sm tracking-widest mb-6">Mystery Dimension</p>
              <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
                أسرار تُرسل إلى الفراغ وتصل إلى غريب مجهول.<br />تُقرأ مرة واحدة ثم تختفي إلى الأبد.
              </p>

              <div className="flex flex-col gap-3 items-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode("write")}
                  className="px-8 py-3.5 rounded-full text-sm border border-purple-400/40 bg-purple-400/10 text-purple-300 hover:bg-purple-400/20 transition-all duration-300"
                >
                  ✦ ابعث سراً إلى الغموض
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReceive}
                  className="px-8 py-3.5 rounded-full text-sm border border-white/10 bg-white/3 text-white/40 hover:text-white/70 hover:bg-white/8 transition-all duration-300"
                >
                  ⬡ استقبل سراً من الكون
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Write mode */}
          {mode === "write" && !sent && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <p className="text-purple-300 text-lg font-light tracking-widest mb-1">سرك إلى الفراغ</p>
                <p className="text-white/30 text-xs">يُقرأ مرة واحدة بعيداً عنك — ثم يختفي إلى الأبد</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-20"
                  style={{ background: "radial-gradient(circle, #C084FC, transparent)" }} />
                <textarea
                  value={secretContent}
                  onChange={e => setSecretContent(e.target.value)}
                  placeholder="السر الذي لا تستطيع قوله لأحد..."
                  className="relative w-full h-40 bg-black/50 border border-purple-500/20 rounded-2xl p-5 text-white/90 placeholder:text-white/20 resize-none text-sm focus:outline-none focus:border-purple-500/40 transition-colors leading-relaxed"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode("idle")}
                  className="flex-1 py-3 rounded-full border border-white/10 text-white/30 text-sm hover:text-white/60 transition-colors"
                >
                  إلغاء
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!secretContent.trim() || sendSecret.isPending}
                  className="flex-1 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-30"
                  style={{ background: "#C084FC", color: "#0B0E14" }}
                >
                  {sendSecret.isPending ? "يُرسل..." : "أرسل إلى الفراغ"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Sent confirmation */}
          {sent && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 0] }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full border border-purple-400"
                style={{ boxShadow: "0 0 40px -4px #C084FC" }}
              />
              <p className="text-purple-300 text-lg font-light tracking-widest mb-2">انطلق سرك</p>
              <p className="text-white/30 text-xs">يسافر الآن عبر الفضاء إلى روح مجهولة...</p>
            </motion.div>
          )}

          {/* Read mode */}
          {mode === "read" && (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <p className="text-purple-300 text-lg font-light tracking-widest mb-1">سر وصلك من الكون</p>
                <p className="text-white/30 text-xs">سيختفي بعد مغادرتك هذه الصفحة</p>
              </div>

              {receiveSecret.isPending ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border border-purple-400/30 border-t-purple-400 animate-spin" />
                </div>
              ) : receivedSecret ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5"
                  >
                    <div className="absolute top-3 right-3 text-purple-500/30 text-xs">سر مجهول</div>
                    <p className="text-white/80 text-sm leading-loose pt-4">{receivedSecret}</p>
                  </motion.div>

                  {!responded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex gap-3"
                    >
                      <button
                        onClick={() => { setResponded(true); setTimeout(() => setMode("idle"), 2000); }}
                        className="flex-1 py-3 rounded-full border border-purple-400/30 text-purple-300/70 text-xs hover:bg-purple-400/10 transition-all"
                      >
                        ♡ أرسل نبضة فهم
                      </button>
                      <button
                        onClick={() => setMode("idle")}
                        className="flex-1 py-3 rounded-full border border-white/10 text-white/30 text-xs hover:text-white/50 transition-all"
                      >
                        أغلق
                      </button>
                    </motion.div>
                  )}

                  {responded && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-purple-300/60 text-xs py-2"
                    >
                      ✓ وصلت نبضة فهمك إلى صاحب السر
                    </motion.p>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
