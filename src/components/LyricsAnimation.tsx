import { memo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { lyrics } from "../data/content";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const TOTAL = lyrics.length;

/**
 * 单行歌词。
 * 以「焦点行」的距离 d 驱动：下方浮现 → 停留发光 → 上方消散。
 */
const LyricRow = memo(function LyricRow({
  index,
  focus,
  text,
  emphasis,
  reduced,
}: {
  index: number;
  focus: MotionValue<number>;
  text: string;
  emphasis: boolean;
  reduced: boolean;
}) {
  // 负数 = 还没轮到（在下方），正数 = 已经唱过（在上方）
  const d = useTransform(focus, (f) => f - index);

  // 焦点行附近保持一段「接近全亮」的平台，避免滑动中段没有主角
  const opacity = useTransform(
    d,
    [-2.7, -1.05, -0.42, 0, 0.42, 1.05, 2.7],
    [0, 0.16, 0.88, 1, 0.88, 0.16, 0],
  );
  const y = useTransform(d, [-1.35, 0, 1.35], [54, 0, -54]);
  const scale = useTransform(d, [-1, 0, 1], [0.94, 1, 0.94]);
  const blur = useTransform(
    d,
    [-1.9, -0.55, 0, 0.55, 1.9],
    [reduced ? 0 : 9, reduced ? 0 : 3, 0, reduced ? 0 : 3, reduced ? 0 : 9],
  );
  const filter = useTransform(blur, (b) => `blur(${b.toFixed(2)}px)`);

  // 焦点行的光晕与亮度
  const glow = useTransform(d, [-0.72, 0, 0.72], [0, 1, 0]);
  const textShadow = useTransform(glow, (g) => {
    if (emphasis) {
      return `0 0 ${18 * g + 6}px rgba(242,180,65,${0.42 * g}), 0 0 ${
        44 * g
      }px rgba(240,134,78,${0.24 * g})`;
    }
    return `0 0 ${16 * g}px rgba(255,232,190,${0.5 * g})`;
  });
  const letterSpacing = useTransform(
    glow,
    (g) => `${(0.028 + g * 0.052).toFixed(4)}em`,
  );

  const size = emphasis
    ? "text-[clamp(1.45rem,5.4vw,3.15rem)] font-serif"
    : "text-[clamp(1rem,2.9vw,1.6rem)]";

  return (
    <motion.div
      className={`lyric-line ${emphasis ? "lyric-emphasis" : ""}`}
      style={{ opacity, y, scale, filter }}
    >
      <motion.p
        className={`${size} font-light leading-[1.62] ${
          emphasis ? "text-dusk-gradient" : "text-ink"
        }`}
        style={{ textShadow, letterSpacing }}
      >
        {text}
      </motion.p>
    </motion.div>
  );
});

/** 沉浸式歌词：整段随滚动推进，当前行高亮，其余渐隐 */
export default function LyricsAnimation() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // 首尾留白，让第一行与最后一行都能真正「停住」
  const focus = useTransform(scrollYProgress, [0.04, 0.96], [0, TOTAL - 1], {
    clamp: true,
  });

  const railScale = useTransform(scrollYProgress, [0.04, 0.96], [0, 1], {
    clamp: true,
  });

  return (
    <section
      id="lyrics"
      ref={trackRef}
      className="lyrics-track relative"
      style={{ "--n": TOTAL - 1 } as React.CSSProperties}
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-5">
        {/* 歌词区的柔光衬底，让文字从背景里「浮」出来 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 44% at 50% 50%, rgba(255,250,238,0.72) 0%, rgba(255,250,238,0.28) 46%, transparent 74%)",
          }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-3xl">
          <div className="flex flex-col items-center">
            {lyrics.map((line, i) => (
              <LyricRow
                key={line.text}
                index={i}
                focus={focus}
                text={line.text}
                emphasis={Boolean(line.emphasis)}
                reduced={reduced}
              />
            ))}
          </div>
        </div>

        {/* 右侧进度导轨：轻声提示「歌还在唱」 */}
        <div
          className="pointer-events-none absolute right-5 top-1/2 hidden h-52 w-px -translate-y-1/2 bg-ink-faint/25 sm:block"
          aria-hidden="true"
        >
          <motion.span
            className="absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-sun to-ember"
            style={{ height: "100%", scaleY: railScale }}
          />
        </div>
      </div>
    </section>
  );
}
