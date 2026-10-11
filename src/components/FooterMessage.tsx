import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { footer } from "../data/content";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** 结尾：夕阳沉入地平线，留下一句可以带走的祝福 */
export default function FooterMessage() {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  // 夕阳缓缓落下
  const sunY = useTransform(scrollYProgress, [0, 1], ["-40%", "42%"]);
  const sunScale = useTransform(scrollYProgress, [0, 1], [1.25, 0.86]);
  const sunOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [0.35, 0.85, 1]);

  const dusk = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgba(253,240,220,0)", "rgba(247,196,146,0.62)"],
  );

  const d = (v: number) => (reduced ? 0 : v);

  return (
    <footer
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-24 text-center"
    >
      {/* 黄昏底色 */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundColor: dusk }}
        aria-hidden="true"
      />

      {/* 落日 */}
      <motion.div
        className="pointer-events-none absolute left-1/2 -z-10 h-[clamp(220px,42vw,480px)] w-[clamp(220px,42vw,480px)] -translate-x-1/2 rounded-full"
        style={{
          top: "50%",
          y: sunY,
          scale: sunScale,
          opacity: sunOpacity,
          background:
            "radial-gradient(circle, #fff3d6 0%, #ffd98a 24%, #f2b441 46%, #f0864e 68%, rgba(240,134,78,0) 82%)",
          filter: "blur(6px)",
        }}
        aria-hidden="true"
      />

      {/* 地平线光带 */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 -z-10 h-56"
        style={{
          top: "58%",
          background:
            "linear-gradient(to bottom, rgba(255,224,168,0.7), transparent)",
          filter: "blur(26px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: d(14) }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: d(1.2), ease: EASE }}
        >
          {footer.eyebrow}
        </motion.span>

        <motion.p
          className="mt-10 font-serif text-[clamp(1.6rem,5.4vw,3.1rem)] leading-[1.72] font-light tracking-[0.05em] whitespace-pre-line text-ink"
          initial={{ opacity: 0, y: d(28), filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: d(1.6), delay: d(0.2), ease: EASE }}
        >
          {footer.poem}
        </motion.p>

        <motion.div
          className="mt-12 flex items-center gap-3"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: d(1.4), delay: d(0.5), ease: EASE }}
          aria-hidden="true"
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-ink-faint/55" />
          <span className="h-1.5 w-1.5 rounded-full bg-ember shadow-[0_0_14px_rgba(240,134,78,0.9)]" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-ink-faint/55" />
        </motion.div>

        <motion.p
          className="mt-12 font-serif text-[clamp(1.25rem,3.8vw,2rem)] leading-[1.9] font-light tracking-[0.14em] text-dusk-gradient"
          style={{ animation: reduced ? undefined : "breathe 7.4s ease-in-out infinite" }}
          initial={{ opacity: 0, y: d(22) }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: d(1.5), delay: d(0.72), ease: EASE }}
        >
          {footer.closing}
        </motion.p>

        <motion.p
          className="mt-16 text-[0.72rem] tracking-[0.3em] text-ink-faint"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: d(1.4), delay: d(1.1) }}
        >
          {footer.signature}
        </motion.p>
      </div>

      {/* 归巢的鸟群剪影，给结尾一点生活感 */}
      <div
        className="pointer-events-none absolute top-[22%] left-0 w-full opacity-40"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            width="26"
            height="14"
            viewBox="0 0 26 14"
            className="absolute text-ink-soft"
            style={{
              top: `${i * 22}px`,
              animation: `cloud-drift ${86 + i * 17}s linear ${-i * 22}s infinite`,
            }}
          >
            <path
              d="M1 9c3.4-5 6.2-5 9.2 0 3-5 5.8-5 9.2 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        ))}
      </div>
    </footer>
  );
}
