import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, AlertTriangle } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { formatTime } from "@/store/timerStore";

interface TimerProps {
  roomId?: string;
  onComplete?: (session: any) => void;
}

export function Timer({ roomId, onComplete }: TimerProps) {
  const [subjectInput, setSubjectInput] = useState("");
  const [showStop, setShowStop] = useState(false);
  const [stopMeta, setStopMeta] = useState({ memo: "", rating: 0 });

  const {
    status,
    elapsedSeconds,
    distractionCount,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    setSubject,
    subject,
  } = useTimer(roomId);

  const handleStart = async () => {
    if (!subjectInput.trim()) return;
    await startSession(subjectInput.trim());
    setSubject(subjectInput.trim());
  };

  const handleStop = async () => {
    const done = await stopSession(stopMeta);
    setShowStop(false);
    setStopMeta({ memo: "", rating: 0 });
    onComplete?.(done);
  };

  return (
    <>
      <div className="border border-gray-100 p-8">
        {/* Status row */}
        <div className="flex items-center gap-2 mb-6">
          <motion.span
            animate={{ opacity: status === "running" ? [1, 0.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`w-2 h-2 rounded-full ${
              status === "running"
                ? "bg-black"
                : status === "paused"
                  ? "bg-gray-400"
                  : "bg-gray-200"
            }`}
          />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400">
            {status === "running"
              ? "Studying"
              : status === "paused"
                ? "Paused"
                : "Ready to focus"}
          </span>
          {distractionCount > 0 && (
            <div className="ml-auto flex items-center gap-1 font-mono text-[10px] text-gray-400">
              <AlertTriangle size={10} />
              {distractionCount} distraction{distractionCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Time display */}
        <motion.div
          className="font-mono text-7xl font-light tabular-nums text-center mb-2 leading-none"
          animate={{ opacity: status === "paused" ? 0.35 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatTime(elapsedSeconds)}
        </motion.div>

        {/* Subject label */}
        <AnimatePresence>
          {status !== "idle" && subject && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[11px] tracking-[0.15em] uppercase text-gray-400 text-center mb-8"
            >
              {subject}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Subject input */}
        <AnimatePresence>
          {status === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-6"
            >
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="What are you studying?"
                className="w-full border-b border-gray-200 bg-transparent py-3 text-sm text-center
                           placeholder:text-gray-300 focus:outline-none focus:border-black
                           transition-colors font-mono tracking-wide"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {status === "idle" && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={!subjectInput.trim()}
              className="flex items-center gap-2 bg-black text-white px-10 py-3
                         font-mono text-xs tracking-[0.15em] uppercase
                         disabled:opacity-25 hover:bg-gray-900 transition-opacity"
            >
              <Play size={11} fill="white" /> Start
            </motion.button>
          )}
          {status === "running" && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={pauseSession}
                className="flex items-center gap-2 border border-gray-200 px-7 py-3
                           font-mono text-xs tracking-[0.15em] uppercase hover:border-black transition-colors"
              >
                <Pause size={11} /> Pause
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowStop(true)}
                className="flex items-center gap-2 border border-gray-200 px-7 py-3
                           font-mono text-xs tracking-[0.15em] uppercase hover:border-black transition-colors"
              >
                <Square size={11} /> Stop
              </motion.button>
            </>
          )}
          {status === "paused" && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={resumeSession}
                className="flex items-center gap-2 bg-black text-white px-7 py-3
                           font-mono text-xs tracking-[0.15em] uppercase hover:bg-gray-900"
              >
                <Play size={11} fill="white" /> Resume
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowStop(true)}
                className="flex items-center gap-2 border border-gray-200 px-7 py-3
                           font-mono text-xs tracking-[0.15em] uppercase hover:border-black transition-colors"
              >
                <Square size={11} /> Stop
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Stop modal */}
      <AnimatePresence>
        {showStop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowStop(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm p-8 shadow-xl"
            >
              <h3 className="font-display font-bold text-xl mb-0.5">
                End Session
              </h3>
              <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-6">
                {formatTime(elapsedSeconds)} studied
              </p>
              <div className="space-y-5 mb-6">
                <div>
                  <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={stopMeta.memo}
                    onChange={(e) =>
                      setStopMeta((p) => ({ ...p, memo: e.target.value }))
                    }
                    placeholder="What did you accomplish?"
                    className="w-full border border-gray-200 p-3 text-sm focus:outline-none
                               focus:border-black resize-none transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-2">
                    Session Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          setStopMeta((p) => ({ ...p, rating: r }))
                        }
                        className={`w-10 h-10 border font-mono text-sm transition-colors ${
                          stopMeta.rating >= r
                            ? "bg-black text-white border-black"
                            : "border-gray-200 text-gray-400 hover:border-black"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleStop}
                  className="flex-1 bg-black text-white py-3 font-mono text-xs tracking-[0.15em] uppercase hover:bg-gray-900"
                >
                  Save & End
                </button>
                <button
                  onClick={() => setShowStop(false)}
                  className="px-6 border border-gray-200 font-mono text-xs tracking-[0.15em] uppercase hover:border-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
