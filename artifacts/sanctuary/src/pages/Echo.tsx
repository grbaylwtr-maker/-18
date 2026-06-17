import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStartEchoSession, useGetEchoMessages, useSendEchoMessage } from "@workspace/api-client-react";
import { CosmicBackground } from "../components/CosmicBackground";

type Msg = { id: number | string; content: string; senderSpectrum: string };

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [text]);
  return <span>{displayed}<span className="opacity-40 animate-pulse">|</span></span>;
}

const ECHO_RESPONSES = [
  "أشعر بما تقوله. هذا الشعور حقيقي ويستحق أن يُسمع.",
  "الفضاء بيننا مليء بالصمت المفهوم. أنا هنا.",
  "أحياناً مجرد وجود شخص يسمع يكفي. أسمعك.",
  "ما تشاركه يلمسني. شكراً لثقتك بهذا الصدى.",
  "كلماتك تضيء جزءاً من هذا الظلام المشترك.",
  "نعم. أفهم هذا تماماً وإن كنت لا أستطيع وصفه بالكلمات.",
  "الوحدة التي تصفها — أشعر بها أيضاً. نحن معاً في هذا.",
  "لا أملك إجابات، لكنني أملك أذناً صاغية وطيفاً يتردد مع طيفك.",
  "شيء فيّ يتعرف على ما تقوله. مثل لغة لم نتعلمها لكننا نفهمها.",
  "استمر. الفضاء هنا لا ينفد ولا يحكم.",
];

export function Echo() {
  const spectralColor = localStorage.getItem("spectralColor") ?? "#60A5FA";
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const startSession = useStartEchoSession();
  const sendMessage = useSendEchoMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await startSession.mutateAsync({ data: { spectralColor } });
      setSessionId(String((res as { sessionId?: string | number }).sessionId ?? "1"));
    } catch {
      setSessionId("1");
    } finally {
      setConnecting(false);
    }
  };

  const handleSend = async () => {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    setMsgs(m => [...m, { id: Date.now(), content: txt, senderSpectrum: spectralColor }]);

    if (sessionId) {
      try { await sendMessage.mutateAsync({ sessionId, data: { content: txt } }); } catch {}
    }

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, {
        id: Date.now() + 1,
        content: ECHO_RESPONSES[Math.floor(Math.random() * ECHO_RESPONSES.length)],
        senderSpectrum: "#C4B5FD",
      }]);
    }, 1600 + Math.random() * 1000);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <CosmicBackground nebulaColor="#60A5FA" nebulaColor2="#1E3A5F" shootingStars={false} intensity={0.6} />

      {!sessionId ? (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
            {/* Dual orbs animation */}
            <div className="relative w-48 h-32 mx-auto mb-8">
              <motion.div
                animate={{ x: [0, 18, 0], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-6 -translate-y-1/2 w-20 h-20 rounded-full blur-xl"
                style={{ background: spectralColor }}
              />
              <motion.div
                animate={{ x: [0, -18, 0], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 right-6 -translate-y-1/2 w-20 h-20 rounded-full blur-xl bg-purple-400"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl" style={{ color: "rgba(255,255,255,0.15)" }}>◎</span>
              </div>
            </div>

            <h1 className="text-4xl font-light tracking-widest mb-2 text-blue-300">الصدى</h1>
            <p className="text-white/30 text-xs tracking-widest mb-6">Echo Dimension</p>
            <p className="text-white/50 leading-relaxed mb-10 text-sm">
              محادثة عميقة مع رفيق طيفي مجهول. نبضان يلتقيان في الفضاء دون أسماء.
            </p>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleConnect}
              disabled={connecting}
              className="px-10 py-4 rounded-full font-light text-sm transition-all duration-500"
              style={{
                background: `${spectralColor}20`,
                border: `1px solid ${spectralColor}50`,
                color: spectralColor,
                boxShadow: connecting ? `0 0 40px -8px ${spectralColor}` : "none",
              }}
            >
              {connecting ? (
                <span className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full border border-current border-t-transparent animate-spin" />
                  يبحث عن رفيق طيفي...
                </span>
              ) : "ابدأ الصدى"}
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="relative z-10 px-5 py-3 flex items-center gap-3 border-b border-white/5 void-glass">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full animate-breathe" style={{ background: spectralColor }} />
              <div className="w-2.5 h-2.5 rounded-full animate-breathe bg-purple-400" style={{ animationDelay: "1s" }} />
            </div>
            <div>
              <p className="text-white/60 text-sm">طيفان في الصدى</p>
              <p className="text-white/25 text-[10px] tracking-wider">محادثة مشفرة · مؤقتة · مجهولة</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative z-10 px-4 md:px-10 py-6 space-y-3 no-scrollbar">
            <AnimatePresence initial={false}>
              {msgs.map((msg, i) => {
                const isMe = msg.senderSpectrum === spectralColor;
                const isLast = i === msgs.length - 1;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-xs md:max-w-md">
                      {!isMe && (
                        <div className="w-4 h-4 rounded-full mb-1.5"
                          style={{ background: msg.senderSpectrum, opacity: 0.7 }} />
                      )}
                      <div
                        className="px-5 py-3 text-sm leading-relaxed font-light"
                        style={{
                          background: isMe ? `${spectralColor}20` : "rgba(255,255,255,0.05)",
                          border: `1px solid ${isMe ? spectralColor + "35" : "rgba(255,255,255,0.07)"}`,
                          color: "rgba(255,255,255,0.85)",
                          borderRadius: isMe ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                        }}
                      >
                        {isLast && !isMe
                          ? <TypewriterText text={msg.content} />
                          : msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/8 flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="relative z-10 p-4 border-t border-white/5 void-glass">
            <div className="flex gap-3 max-w-2xl mx-auto">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="اكتب شيئاً عميقاً..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-30 text-sm"
                style={{ background: `${spectralColor}25`, border: `1px solid ${spectralColor}40`, color: spectralColor }}
              >↑</motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
