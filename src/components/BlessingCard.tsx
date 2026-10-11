import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { blessings } from "../data/content";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Heart = {
  id: number;
  x: number;
  drift: number;
  delay: number;
  scale: number;
  hue: string;
};

const HEART_HUES = ["#e98a8a", "#f2b441", "#f0864e", "#e9a0b8"];

function makeHearts(n: number, offset: number): Heart[] {
  return Array.from({ length: n }, (_, i) => {
    const s = (i * 7919 + offset * 104729) % 65537;
    const r = s / 65537;
    const r2 = ((i * 3253 + 977) % 32771) / 32771;
    return {
      id: offset * 100 + i,
      x: (r - 0.5) * 150,
      drift: (r2 - 0.5) * 90,
      delay: r * 0.5,
      scale: 0.6 + r2 * 0.8,
      hue: HEART_HUES[i % HEART_HUES.length],
    };
  });
}

/** 互动祝福卡：点一次翻出一句温暖的话，带光晕与爱心粒子 */
export default function BlessingCard() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState<number | null>(null);
  const [turn, setTurn] = useState(0);

  const hearts = useMemo(() => makeHearts(14, turn), [turn]);

  const draw = useCallback(() => {
    setIndex((prev) => {
      if (blessings.length === 1) return 0;
      let next = Math.floor(Math.random() * blessings.length);
      // 避免连续抽到同一句
      if (next === prev) next = (next + 1 + Math.floor(Math.random() * (blessings.length - 1))) % blessings.length;
      return next;
    });
    setTurn((t) => t + 1);
  }, []);

  const revealed = index !== null;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-full max-w-[38rem]"
        style={{ perspective: "1600px" }}
      >
        {/* 卡片背后的呼吸光晕 */}
        <motion.div
          className="pointer-events-none absolute -inset-8 rounded-[40px]"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 45%, rgba(242,180,65,0.34) 0%, rgba(240,134,78,0.16) 46%, transparent 74%)",
            filter: "blur(18px)",
          }}
          animate={
            reduced
              ? undefined
              : { opacity: revealed ? [0.7, 1, 0.7] : [0.34, 0.6, 0.34], scale: revealed ? [1, 1.04, 1] : 1 }
          }
          transition={{ duration: revealed ? 5.4 : 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />

        <motion.div
          className="card-soft relative overflow-hidden px-7 py-12 text-center sm:px-14 sm:py-16"
          animate={
            reduced
              ? undefined
              : revealed
                ? { y: [0, -6, 0] }
                : { y: [0, -9, 0] }
          }
          transition={{ duration: revealed ? 6.4 : 8.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* 卡片内的柔光扫过 */}
          <span
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent"
            style={{ animation: "shimmer 7.5s ease-in-out 1.4s infinite" }}
            aria-hidden="true"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={revealed ? `b-${index}-${turn}` : "prompt"}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, rotateX: -68, y: 26, filter: "blur(10px)" }
              }
              animate={{ opacity: 1, rotateX: 0, y: 0, filter: "blur(0px)" }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, rotateX: 42, y: -18, filter: "blur(8px)" }
              }
              transition={{ duration: reduced ? 0.35 : 1.05, ease: EASE }}
              style={{ transformStyle: "preserve-3d", transformOrigin: "50% 100%" }}
              className="relative"
            >
              <span className="block text-[0.66rem] tracking-[0.34em] text-ink-faint">
                {revealed ? "今日份的祝福" : "送给今天的你"}
              </span>

              <p
                className={`mt-7 font-serif leading-[1.9] font-light ${
                  revealed
                    ? "text-[clamp(1.15rem,3.4vw,1.7rem)] text-ink"
                    : "text-[clamp(1.05rem,3vw,1.45rem)] text-ink-soft"
                }`}
              >
                {revealed ? blessings[index as number] : "有些话，需要被说出来才算数。"}
              </p>

              {revealed ? (
                <motion.span
                  className="mt-7 block text-[0.68rem] tracking-[0.28em] text-ink-faint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.35 }}
                >
                  第 {turn} 次相遇
                </motion.span>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* 爱心粒子：每次抽取重新生成 */}
          <div
            className="pointer-events-none absolute inset-0 overflow-visible"
            aria-hidden="true"
          >
            <AnimatePresence>
              {revealed && !reduced
                ? hearts.map((h) => (
                    <motion.svg
                      key={h.id}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      className="absolute left-1/2 bottom-6"
                      style={{ color: h.hue }}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                      animate={{
                        opacity: [0, 0.95, 0.75, 0],
                        x: [0, h.x * 0.6, h.x],
                        y: [0, -70 - h.scale * 40, -150 - h.scale * 70],
                        scale: [0.3, h.scale, h.scale * 0.7],
                        rotate: [0, h.drift],
                      }}
                      transition={{
                        duration: 3.6,
                        delay: h.delay,
                        ease: "easeOut",
                      }}
                      exit={{ opacity: 0 }}
                    >
                      <path
                        d="M8 14s-5.4-3.3-5.4-7.2A3 3 0 0 1 8 4.6a3 3 0 0 1 5.4 2.2C13.4 10.7 8 14 8 14Z"
                        fill="currentColor"
                      />
                    </motion.svg>
                  ))
                : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mt-11 flex flex-wrap items-center justify-center gap-4"
        initial={{ opacity: 0, y: reduced ? 0 : 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduced ? 0.3 : 1.1, ease: EASE }}
      >
        <button type="button" className="btn btn-primary" onClick={draw}>
          <span className="relative z-10">{revealed ? "再收一份祝福" : "收下一份祝福"}</span>
          <svg
            className="relative z-10"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M8 13.6S2.6 10.3 2.6 6.4A3 3 0 0 1 8 4.2a3 3 0 0 1 5.4 2.2c0 3.9-5.4 7.2-5.4 7.2Z"
              fill="currentColor"
              opacity="0.85"
            />
          </svg>
        </button>

        {revealed ? (
          <button type="button" className="btn btn-ghost" onClick={() => setIndex(null)}>
            收起来
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}
