import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { smileMessages } from "../data/content";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Spark = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
};

type Star = {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  dx: number;
  color: string;
};

const SPARK_COLORS = [
  "#f2b441",
  "#f0864e",
  "#e98a8a",
  "#a8c8de",
  "#8fae7e",
  "#ffd98a",
];

const rnd = (i: number, salt: number) => {
  const v = (i * 7919 + salt * 104729) % 65537;
  return v / 65537;
};

/** 微笑互动：按下微笑按钮，彩色光点炸开、星星飘落 */
export default function SmileInteraction() {
  const reduced = usePrefersReducedMotion();
  const [bursts, setBursts] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const burst = useMemo(() => {
    if (bursts === 0) return null;
    const sparks: Spark[] = Array.from({ length: 24 }, (_, i) => ({
      id: bursts * 100 + i,
      angle: (360 / 24) * i + rnd(i, bursts) * 18,
      distance: 90 + rnd(i, bursts + 1) * 150,
      size: 5 + rnd(i, bursts + 2) * 9,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      delay: rnd(i, bursts + 3) * 0.22,
    }));
    const stars: Star[] = Array.from({ length: 26 }, (_, i) => ({
      id: bursts * 1000 + i,
      left: rnd(i, bursts + 4) * 100,
      duration: 3.4 + rnd(i, bursts + 5) * 3.2,
      delay: rnd(i, bursts + 6) * 1.4,
      size: 9 + rnd(i, bursts + 7) * 13,
      dx: (rnd(i, bursts + 8) - 0.5) * 160,
      color: SPARK_COLORS[(i + 2) % SPARK_COLORS.length],
    }));
    return { sparks, stars };
  }, [bursts]);

  const onClick = useCallback(() => {
    setBursts((b) => b + 1);
    setMessage((prev) => {
      if (smileMessages.length === 1) return smileMessages[0];
      let next = smileMessages[Math.floor(Math.random() * smileMessages.length)];
      if (next === prev) {
        next =
          smileMessages[
            (smileMessages.indexOf(next) + 1) % smileMessages.length
          ];
      }
      return next;
    });
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* 光点与星星的舞台 */}
      <div
        className="pointer-events-none absolute inset-0 -z-0 overflow-visible"
        aria-hidden="true"
      >
        <AnimatePresence>
          {burst && !reduced
            ? burst.sparks.map((s) => {
                const rad = (s.angle * Math.PI) / 180;
                return (
                  <motion.span
                    key={s.id}
                    className="absolute top-[42%] left-1/2 rounded-full"
                    style={{
                      width: s.size,
                      height: s.size,
                      background: s.color,
                      boxShadow: `0 0 ${s.size * 2.4}px ${s.color}`,
                    }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                    animate={{
                      opacity: [0, 1, 0.85, 0],
                      x: Math.cos(rad) * s.distance,
                      y: Math.sin(rad) * s.distance,
                      scale: [0.2, 1.15, 0.85, 0.4],
                    }}
                    transition={{ duration: 2.5, delay: s.delay, ease: "easeOut" }}
                    exit={{ opacity: 0 }}
                  />
                );
              })
            : null}
        </AnimatePresence>

        <AnimatePresence>
          {burst && !reduced
            ? burst.stars.map((st) => (
                <motion.svg
                  key={st.id}
                  width={st.size}
                  height={st.size}
                  viewBox="0 0 24 24"
                  className="absolute -top-6"
                  style={
                    {
                      left: `${st.left}%`,
                      color: st.color,
                      "--star-dx": `${st.dx}px`,
                    } as React.CSSProperties
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.9, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: st.duration, delay: st.delay, ease: "linear" }}
                >
                  <path
                    d="M12 2.6l2.6 6.1 6.6.5-5 4.3 1.5 6.4L12 16.4l-5.7 3.5 1.5-6.4-5-4.3 6.6-.5L12 2.6Z"
                    fill="currentColor"
                    style={{ animation: `star-fall ${st.duration}s linear ${st.delay}s infinite` }}
                  />
                </motion.svg>
              ))
            : null}
        </AnimatePresence>
      </div>

      {/* 微笑按钮 */}
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="好好打扮你的微笑"
        className="group relative grid h-40 w-40 place-items-center rounded-full sm:h-48 sm:w-48"
        whileHover={reduced ? undefined : { scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* 外圈呼吸光环 */}
        <span
          className="pointer-events-none absolute inset-0 animate-halo-pulse rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,226,170,0.85) 0%, rgba(242,180,65,0.34) 46%, transparent 72%)",
            filter: "blur(8px)",
          }}
          aria-hidden="true"
        />
        <span
          className="glass absolute inset-3 rounded-full transition-shadow duration-700 group-hover:shadow-[0_0_60px_-8px_rgba(242,180,65,0.75)]"
          aria-hidden="true"
        />

        {/* 笑脸 */}
        <span className="relative z-10 flex flex-col items-center gap-2 text-ink">
          <svg width="70" height="70" viewBox="0 0 72 72" aria-hidden="true">
            <circle
              cx="36"
              cy="36"
              r="27"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              opacity="0.5"
            />
            <circle cx="27" cy="31" r="3.1" fill="currentColor" />
            <circle cx="45" cy="31" r="3.1" fill="currentColor" />
            <path
              d="M25 42c3.4 5.4 7.8 8.1 11 8.1S43.6 47.4 47 42"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <circle cx="22" cy="40" r="3.4" fill="#f0864e" opacity="0.22" />
            <circle cx="50" cy="40" r="3.4" fill="#f0864e" opacity="0.22" />
          </svg>
          <span className="text-[0.68rem] tracking-[0.28em] text-ink-soft">
            点一下微笑
          </span>
        </span>
      </motion.button>

      {/* 鼓励文字 */}
      <div className="mt-14 flex min-h-[6rem] w-full max-w-[32rem] items-start justify-center">
        <AnimatePresence mode="wait">
          {message ? (
            <motion.p
              key={message + bursts}
              className="card-soft px-8 py-6 text-center font-serif text-[clamp(1rem,2.8vw,1.3rem)] leading-[1.9] font-light text-ink"
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 22, scale: 0.94, filter: "blur(8px)" }
              }
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(6px)" }}
              transition={{ duration: reduced ? 0.3 : 0.95, ease: EASE }}
            >
              {message}
            </motion.p>
          ) : (
            <motion.p
              key="idle"
              className="pt-4 text-center text-[0.9rem] leading-[2] text-ink-faint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              「好好打扮你的微笑，很灿烂」
              <br />
              这里的微笑按钮，今天可以按很多次。
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
