import {
  useGetGalaxyMessages,
  useSendGalaxyMessage,
  useGetGalaxyPolls,
  useCreateGalaxyPoll,
  useVoteOnPoll,
  getGetGalaxyMessagesQueryKey,
  getGetGalaxyPollsQueryKey,
} from "@workspace/api-client-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CosmicBackground } from "../components/CosmicBackground";
import { Link } from "wouter";

const GALAXY_COLORS: Record<string, string> = {
  "1": "#7C3AED",
  "2": "#FDE047",
  "3": "#FCA5A5",
  "4": "#D97706",
  "5": "#DB2777",
  "6": "#2DD4BF",
  "7": "#FDE047",
  "8": "#1E3A8A",
  "9": "#1E40AF",
  "10": "#C4B5FD",
};

type Tab = "chat" | "polls";

export function GalaxyDetail() {
  const { id } = useParams<{ id: string }>();
  const galaxyId = id ?? "1";
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>("chat");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const spectralColor = localStorage.getItem("spectralColor") ?? "#C4B5FD";
  const color = GALAXY_COLORS[galaxyId] ?? "#C4B5FD";

  const { data: msgData, isLoading } = useGetGalaxyMessages(galaxyId);
  const sendMsg = useSendGalaxyMessage();

  const messages = msgData?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const txt = message.trim();
    if (!txt) return;
    setMessage("");
    try {
      await sendMsg.mutateAsync({ galaxyId, data: { content: txt, spectralColor } });
      queryClient.invalidateQueries({ queryKey: getGetGalaxyMessagesQueryKey(galaxyId) });
    } catch {}
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <CosmicBackground nebulaColor={color} nebulaColor2="#0B0E14" shootingStars={false} intensity={0.7} />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-5 py-3 border-b border-white/5 void-glass">
        <Link href="/galaxy">
          <button className="text-white/30 hover:text-white/70 transition-colors text-sm">←</button>
        </Link>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ background: `radial-gradient(circle at 30% 30%, ${color}90, ${color}20)` }}
          />
          <div>
            <p className="text-white/80 text-sm font-medium">مجرة #{galaxyId}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/25 text-[10px]">{messages.length} رسالة · مباشر</p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mr-auto flex gap-1.5">
          {(["chat", "polls"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 rounded-full text-[11px] border transition-all"
              style={{
                borderColor: tab === t ? color : "rgba(255,255,255,0.08)",
                background: tab === t ? `${color}15` : "transparent",
                color: tab === t ? color : "rgba(255,255,255,0.3)",
              }}
            >
              {t === "chat" ? "◎ محادثة" : "⬟ استطلاعات"}
            </button>
          ))}
        </div>
      </div>

      {/* Chat tab */}
      <AnimatePresence mode="wait">
        {tab === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto relative z-10 px-4 md:px-8 py-5 space-y-3 no-scrollbar">
              {isLoading ? (
                <div className="flex justify-center pt-20">
                  <div className="w-8 h-8 rounded-full border border-white/20 border-t-white/60 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                    <span className="text-2xl">✦</span>
                  </div>
                  <p className="text-white/40 text-sm">كن أول من يُضيء هذه المجرة</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMe = msg.spectralColor === spectralColor;
                    return (
                      <motion.div
                        key={msg.id ?? i}
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 22 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-xs md:max-w-md">
                          {!isMe && (
                            <div
                              className="w-4 h-4 rounded-full mb-1.5 animate-breathe"
                              style={{ background: msg.spectralColor ?? color, opacity: 0.7 }}
                            />
                          )}
                          <div
                            className="px-4 py-2.5 text-sm leading-relaxed font-light"
                            style={{
                              background: isMe ? `${spectralColor}20` : "rgba(255,255,255,0.05)",
                              border: `1px solid ${isMe ? spectralColor + "35" : "rgba(255,255,255,0.07)"}`,
                              color: "rgba(255,255,255,0.85)",
                              borderRadius: isMe ? "1rem 1rem 0.3rem 1rem" : "1rem 1rem 1rem 0.3rem",
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="relative z-10 p-4 border-t border-white/5 void-glass">
              <div className="flex gap-3 max-w-2xl mx-auto">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="اكتب في هذه المجرة..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  dir="rtl"
                />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleSend}
                  disabled={!message.trim() || sendMsg.isPending}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-30 text-sm flex-shrink-0"
                  style={{ background: `${color}25`, border: `1px solid ${color}40`, color }}
                >↑</motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "polls" && (
          <motion.div key="polls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto relative z-10">
            <PollsPanel galaxyId={galaxyId} color={color} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PollsPanel({ galaxyId, color }: { galaxyId: string; color: string }) {
  const queryClient = useQueryClient();
  const { data: polls = [], isLoading } = useGetGalaxyPolls(galaxyId);
  const createPoll = useCreateGalaxyPoll();
  const votePoll = useVoteOnPoll();

  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [voted, setVoted] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    const opts = options.filter((o) => o.trim());
    if (!question.trim() || opts.length < 2) return;
    await createPoll.mutateAsync({ galaxyId, data: { question: question.trim(), options: opts } });
    queryClient.invalidateQueries({ queryKey: getGetGalaxyPollsQueryKey(galaxyId) });
    setQuestion("");
    setOptions(["", ""]);
    setCreating(false);
  };

  const handleVote = async (pollId: string, optionId: string, optionIndex: number) => {
    if (voted[pollId] !== undefined) return;
    await votePoll.mutateAsync({ pollId, data: { optionId } });
    queryClient.invalidateQueries({ queryKey: getGetGalaxyPollsQueryKey(galaxyId) });
    setVoted((v) => ({ ...v, [pollId]: String(optionIndex) }));
  };

  return (
    <div className="px-4 py-5 md:px-8 space-y-4">
      {/* Create button */}
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setCreating((c) => !c)}
          className="px-5 py-2 rounded-full text-xs border transition-all"
          style={{
            borderColor: creating ? color : "rgba(255,255,255,0.1)",
            background: creating ? `${color}15` : "transparent",
            color: creating ? color : "rgba(255,255,255,0.35)",
          }}
        >
          {creating ? "✕ إلغاء" : "⬟ أنشئ استطلاعاً"}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border space-y-3" style={{ borderColor: `${color}25`, background: `${color}08` }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="السؤال..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none"
                dir="rtl"
              />
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) => setOptions((os) => os.map((o, j) => j === i ? e.target.value : o))}
                    placeholder={`الخيار ${i + 1}...`}
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 placeholder:text-white/20 focus:outline-none"
                    dir="rtl"
                  />
                  {options.length > 2 && (
                    <button onClick={() => setOptions((os) => os.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 text-xs px-2">✕</button>
                  )}
                </div>
              ))}
              {options.length < 5 && (
                <button onClick={() => setOptions((os) => [...os, ""])} className="text-xs text-white/30 hover:text-white/50 transition-colors">
                  + إضافة خيار
                </button>
              )}
              <button
                onClick={handleCreate}
                disabled={!question.trim() || options.filter(o => o.trim()).length < 2 || createPoll.isPending}
                className="w-full py-2.5 rounded-xl text-sm transition-all disabled:opacity-30"
                style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
              >
                {createPoll.isPending ? "..." : "أطلق الاستطلاع"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 rounded-full border border-white/20 border-t-white/50 animate-spin" />
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-12 text-white/20 text-xs tracking-widest">
          لا استطلاعات بعد — كن أول من يسأل
        </div>
      ) : (
        polls.map((poll, i) => {
          const options = poll.options as Array<{ id: string; text: string; votes: number }>;
          const total = options.reduce((s, o) => s + (o.votes ?? 0), 0);
          const myVoteIdx = voted[poll.id];
          return (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl border"
              style={{ borderColor: `${color}20`, background: `${color}06` }}
            >
              <p className="text-white/80 text-sm mb-3">{poll.question}</p>
              <div className="space-y-2">
                {options.map((opt, j) => {
                  const pct = total > 0 ? Math.round(((opt.votes ?? 0) / total) * 100) : 0;
                  const isMyVote = myVoteIdx === String(j);
                  return (
                    <button
                      key={opt.id ?? j}
                      onClick={() => handleVote(poll.id, opt.id ?? String(j), j)}
                      disabled={myVoteIdx !== undefined}
                      className="w-full text-right relative overflow-hidden rounded-xl transition-all"
                      style={{
                        border: `1px solid ${isMyVote ? color : "rgba(255,255,255,0.08)"}`,
                        background: "rgba(255,255,255,0.03)",
                        cursor: myVoteIdx !== undefined ? "default" : "pointer",
                      }}
                    >
                      {myVoteIdx !== undefined && (
                        <div
                          className="absolute right-0 top-0 bottom-0 transition-all duration-700 rounded-xl"
                          style={{ width: `${pct}%`, background: `${color}20` }}
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between px-3 py-2.5">
                        <span className="text-[11px]" style={{ color: isMyVote ? color : "rgba(255,255,255,0.6)" }}>
                          {opt.text}
                        </span>
                        {myVoteIdx !== undefined && (
                          <span className="text-[10px]" style={{ color: isMyVote ? color : "rgba(255,255,255,0.3)" }}>
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-white/15 text-[10px] mt-2 text-left">{total} صوت</p>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
