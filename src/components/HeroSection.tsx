import { motion } from "framer-motion";
import { hero } from "../data/content";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** 首页：一句核心文案 + 进入祝福体验的按钮 */
export default function HeroSection({ onEnter }: { onEnter: () => void }) {
  const reduced = usePrefersReducedMotion();
  const d = (v: number) => (reduced ? 0 : v);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pt-24 pb-32 text-center"
    >
      {/* 标题上方的柔和光晕 */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-0 h-[clamp(280px,52vw,620px)] w-[clamp(280px,52vw,620px)] -translate-x-1/2 -translate-y-[58%] animate-halo-pulse rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,225,168,0.62) 0%, rgba(242,180,65,0.22) 42%, transparent 70%)",
          filter: "blur(14px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: d(16) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d(1.2), delay: d(0.1), ease: EASE }}
        >
          {hero.kicker}
        </motion.p>

        <motion.h1
          className="mt-8 font-serif text-[clamp(3.4rem,13vw,5.6rem)] leading-[1.28] font-light tracking-[0.05em]"
          initial={{ opacity: 0, y: d(30), filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: d(1.7), delay: d(0.28), ease: EASE }}
        >
          <span className="text-sun-gradient">{hero.title}</span>
        </motion.h1>

        <motion.div
          className="mt-9 flex items-center gap-3"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: d(1.4), delay: d(0.7), ease: EASE }}
          aria-hidden="true"
        >
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-ink-faint/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-sun shadow-[0_0_12px_rgba(242,180,65,0.9)]" />
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-ink-faint/60" />
        </motion.div>

        <motion.p
          className="mt-9 animate-breathe font-serif text-[clamp(1.15rem,3.2vw,1.75rem)] leading-[1.9] font-light tracking-[0.16em] text-ink-soft"
          initial={{ opacity: 0, y: d(22) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d(1.5), delay: d(0.86), ease: EASE }}
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          className="mt-14"
          initial={{ opacity: 0, y: d(24) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d(1.4), delay: d(1.1), ease: EASE }}
        >
          <button type="button" className="btn btn-primary" onClick={onEnter}>
            <span className="relative z-10">{hero.cta}</span>
            <svg
              className="relative z-10"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* 掠过按钮的柔光 */}
            <span
              className="pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              style={{ animation: "shimmer 4.6s ease-in-out 2.2s infinite" }}
              aria-hidden="true"
            />
          </button>
        </motion.div>

        <motion.div
          className="mt-24 flex flex-col items-center gap-3 text-ink-faint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d(1.6), delay: d(1.7), ease: EASE }}
        >
          <span className="text-[0.68rem] tracking-[0.32em]">
            {hero.scrollHint}
          </span>
          <motion.span
            className="block h-10 w-px bg-gradient-to-b from-ink-faint/70 to-transparent"
            animate={reduced ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
          />
        </motion.div>
      </div>

      {/* 底部植物剪影，点一点绿色 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-[4%] opacity-45"
        aria-hidden="true"
      >
        {[0, 1].map((side) => (
          <svg
            key={side}
            width="150"
            height="130"
            viewBox="0 0 150 130"
            className="animate-sway"
            style={{
              animationDelay: `${side * -3.2}s`,
              transform: `scaleX(${side ? -1 : 1})`,
              color: "#8fae7e",
            }}
          >
            <g fill="currentColor" opacity="0.5">
              <path d="M18 130c0-34 6-58 22-76-4 22-3 46 2 76H18Z" />
              <path d="M52 130c0-42 12-68 34-84-10 26-12 52-6 84H52Z" />
              <path d="M96 130c0-28 10-46 26-58-8 16-10 34-6 58H96Z" />
            </g>
          </svg>
        ))}
      </div>
    </section>
  );
}
