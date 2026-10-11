import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { reminders } from "../data/content";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

const CONFETTI = [
  "#f2b441",
  "#f0864e",
  "#e98a8a",
  "#a8c8de",
  "#8fae7e",
  "#ffd98a",
];

const rnd = (i: number, salt: number) => ((i * 7919 + salt * 104729) % 65537) / 65537;

/** 夜间提醒：四个小目标，全部完成后庆祝 */
export default function DailyReminder() {
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(0);

  const allDone = done.length === reminders.length;

  const confetti = useMemo(() => {
    if (celebrate === 0) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: celebrate * 100 + i,
      left: rnd(i, celebrate) * 100,
      delay: rnd(i, celebrate + 1) * 0.5,
      duration: 2.6 + rnd(i, celebrate + 2) * 2.2,
      size: 6 + rnd(i, celebrate + 3) * 9,
      color: CONFETTI[i % CONFETTI.length],
      rotate: rnd(i, celebrate + 4) * 360,
      round: i % 3 === 0,
    }));
  }, [celebrate]);

  const toggle = useCallback(
    (id: string) => {
      setDone((prev) => {
        const has = prev.includes(id);
        const next = has ? prev.filter((x) => x !== id) : [...prev, id];
        if (next.length === reminders.length && !has) {
          setCelebrate((c) => c + 1);
        }
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setDone([]);
    setCelebrate(0);
  }, []);

  return (
    <div className="relative">
      {/* 庆祝彩纸 */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 h-[70vh] overflow-visible"
        aria-hidden="true"
      >
        <AnimatePresence>
          {!reduced
            ? confetti.map((c) => (
                <motion.span
                  key={c.id}
                  className={c.round ? "absolute rounded-full" : "absolute"}
                  style={{
                    left: `${c.left}%`,
                    width: c.size,
                    height: c.round ? c.size : c.size * 0.42,
                    background: c.color,
                    boxShadow: `0 0 12px ${c.color}55`,
                  }}
                  initial={{ opacity: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [0, 220 + c.duration * 60, 460 + c.duration * 90],
                    rotate: [0, c.rotate, c.rotate * 2],
                    x: [0, (c.left - 50) * 1.4],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }}
                />
              ))
            : null}
        </AnimatePresence>
      </div>

      <div className="card-soft relative mx-auto max-w-[42rem] overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[0.66rem] tracking-[0.32em] text-ink-faint">
              今日小目标
            </span>
            <p className="mt-3 font-serif text-[clamp(1.05rem,2.9vw,1.4rem)] font-light text-ink">
              要吃的饱一点睡的早一点
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[0.72rem] tracking-[0.16em] text-ink-faint tabular-nums">
              {done.length} / {reminders.length}
            </span>
            <div className="h-1 w-24 overflow-hidden rounded-full bg-ink-faint/25">
              <motion.span
                className="block h-full origin-left rounded-full bg-gradient-to-r from-sun to-ember"
                animate={{ scaleX: done.length / reminders.length }}
                transition={{ duration: 0.85, ease: EASE }}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        <ul className="mt-10 flex flex-col divide-y divide-ink-faint/18">
          {reminders.map((item, i) => {
            const checked = done.includes(item.id);
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: reduced ? 0 : -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: reduced ? 0.3 : 0.9,
                  delay: reduced ? 0 : i * 0.12,
                  ease: EASE,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-pressed={checked}
                  className="group flex w-full items-center gap-4 py-5 text-left transition-colors duration-500 hover:bg-white/40 sm:gap-5"
                >
                  <span
                    className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-all duration-500 ${
                      checked
                        ? "border-transparent bg-gradient-to-br from-sun to-ember shadow-[0_6px_18px_-6px_rgba(240,134,78,0.75)]"
                        : "border-ink-faint/45 bg-white/50 group-hover:border-sun/70"
                    }`}
                  >
                    <AnimatePresence>
                      {checked ? (
                        <motion.svg
                          key="tick"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          initial={{ scale: 0.2, opacity: 0, rotate: -24 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.2, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                        >
                          <path
                            d="M3 7.4l2.9 2.9L11 4.6"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      ) : null}
                    </AnimatePresence>
                  </span>

                  <span className="flex flex-1 flex-col">
                    <span
                      className={`font-serif text-[clamp(1rem,2.7vw,1.22rem)] font-light transition-all duration-600 ${
                        checked ? "text-ink-faint line-through decoration-sun/70" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="mt-1 text-[0.78rem] leading-[1.9] text-ink-faint">
                      {item.hint}
                    </span>
                  </span>

                  {checked ? (
                    <motion.span
                      className="hidden shrink-0 text-[0.68rem] tracking-[0.2em] text-sun sm:block"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      完成
                    </motion.span>
                  ) : null}
                </button>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-9 flex min-h-[4.5rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {allDone ? (
              <motion.div
                key={`done-${celebrate}`}
                className="text-center"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.95, ease: EASE }}
              >
                <motion.p
                  className="animate-breathe-soft font-serif text-[clamp(1.1rem,3vw,1.5rem)] font-light text-sun-gradient"
                >
                  今天的你，全部做到了 ✨
                </motion.p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 text-[0.76rem] tracking-[0.2em] text-ink-faint underline decoration-ink-faint/40 underline-offset-4 transition-colors hover:text-ink-soft"
                >
                  明天再来一次
                </button>
              </motion.div>
            ) : (
              <motion.p
                key="progress"
                className="text-center text-[0.85rem] leading-[2] text-ink-faint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              >
                {done.length === 0
                  ? "点一点，记下今天已经照顾好自己的地方。"
                  : `已经照顾好自己 ${done.length} 件事了，很好。`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
