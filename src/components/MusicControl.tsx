import { AnimatePresence, motion } from "framer-motion";
import { musicHint } from "../data/content";
import { useAmbientMusic } from "../hooks/useAmbientMusic";

const EASE = [0.22, 1, 0.36, 1] as const;

/** 背景音乐控制：默认静音，首次点击才创建音频上下文 */
export default function MusicControl() {
  const { playing, volume, setVolume, toggle } = useAmbientMusic();

  return (
    <motion.div
      className="glass fixed top-5 right-4 z-50 flex items-center gap-1 rounded-full py-1.5 pr-1.5 pl-3 sm:top-7 sm:right-7"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 1.4, ease: EASE }}
    >
      <AnimatePresence initial={false}>
        {playing ? (
          <motion.div
            key="vol"
            className="flex items-center gap-2 pr-1"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2.5 6h2L7.5 3.6v8.8L4.5 10h-2V6Z"
                fill="currentColor"
                opacity="0.75"
              />
              <path
                d="M10 5.6c1 .8 1 4 0 4.8"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-ink-faint/35 accent-[#f0864e] sm:w-24"
              aria-label="音量"
            />
          </motion.div>
        ) : (
          <motion.span
            key="hint"
            className="hidden pr-1 text-[0.66rem] tracking-[0.18em] text-ink-faint sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {musicHint}
          </motion.span>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "暂停背景音乐" : "播放背景音乐"}
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors duration-500 hover:bg-white/70 hover:text-ink"
      >
        {playing ? (
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="3.5" y="3" width="3.2" height="10" rx="1.2" fill="currentColor" />
            <rect x="9.3" y="3" width="3.2" height="10" rx="1.2" fill="currentColor" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M5 3.4c0-.8.9-1.3 1.6-.9l6 3.6c.7.4.7 1.4 0 1.8l-6 3.6c-.7.4-1.6-.1-1.6-.9V3.4Z"
              fill="currentColor"
            />
          </svg>
        )}
        {playing ? (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-sun/60"
            animate={{ scale: [1, 1.22, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        ) : null}
      </button>
    </motion.div>
  );
}
