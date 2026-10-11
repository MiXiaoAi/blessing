import { memo, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { lyrics } from "../data/content";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../hooks/useMediaQuery";

const TOTAL = lyrics.length;

/**
 * 进度区间：留出首尾一点余量，让第一行与最后一行都能真正「停住」。
 * 焦点映射与吸附点共用这组参数，保证两者严格对齐。
 */
const SNAP_START = 0.035;
const SNAP_END = 0.965;

/**
 * 单行歌词。
 *
 * 每行绝对定位在容器垂直中心，再由 (行号 - 焦点行) × 行距 决定偏移，
 * 因此焦点行永远落在正中，与行号无关——行数再多也不会溢出视口。
 */
const LyricRow = memo(function LyricRow({
  index,
  focus,
  text,
  emphasis,
  reduced,
  slotRem,
  rich,
}: {
  index: number;
  focus: MotionValue<number>;
  text: string;
  emphasis: boolean;
  reduced: boolean;
  slotRem: number;
  /** 是否启用高开销的模糊 / 文字光晕（仅桌面端） */
  rich: boolean;
}) {
  // 负数 = 还没轮到（在下方），正数 = 已经唱过（在上方）
  const d = useTransform(focus, (f) => f - index);

  // 焦点行附近保持一段「接近全亮」的平台，避免滑动中段没有主角
  const opacity = useTransform(
    d,
    [-2.4, -1.02, -0.4, 0, 0.4, 1.02, 2.4],
    [0, 0.14, 0.86, 1, 0.86, 0.14, 0],
  );
  const y = useTransform(d, (v) => `${(v * slotRem).toFixed(3)}rem`);
  const scale = useTransform(d, [-1, 0, 1], [0.93, 1, 0.93]);

  /**
   * 性能取舍：
   * blur / textShadow / letterSpacing 都是每帧高开销属性——前者触发 GPU 模糊，
   * 后两者触发文字重绘与重排版（letterSpacing 会 layout thrash）。
   * 因此只在桌面端启用；移动端仅保留 opacity / transform，走合成器，几乎免费。
   */
  const blur = useTransform(
    d,
    [-1.7, -0.5, 0, 0.5, 1.7],
    [reduced ? 0 : 10, reduced ? 0 : 3, 0, reduced ? 0 : 3, reduced ? 0 : 10],
  );
  const filter = useTransform(blur, (b) =>
    rich ? `blur(${b.toFixed(2)}px)` : "none",
  );

  // 焦点行的光晕、字距与亮度
  const glow = useTransform(d, [-0.7, 0, 0.7], [0, 1, 0]);
  const textShadow = useTransform(glow, (g) => {
    if (!rich) return "none";
    return emphasis
      ? `0 0 ${18 * g + 6}px rgba(242,180,65,${0.42 * g}), 0 0 ${
          44 * g
        }px rgba(240,134,78,${0.24 * g})`
      : `0 0 ${16 * g}px rgba(255,232,190,${0.5 * g})`;
  });
  const letterSpacing = useTransform(glow, (g) =>
    rich ? `${(0.028 + g * 0.05).toFixed(4)}em` : "0.028em",
  );

  const size = emphasis
    ? "text-[clamp(1.4rem,5vw,2.95rem)] font-serif"
    : "text-[clamp(1rem,2.7vw,1.55rem)]";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
      <motion.div className="flex justify-center px-1" style={{ opacity, y, scale, filter }}>
        <motion.p
          className={`${size} text-center font-light leading-[1.6] ${
            emphasis ? "text-dusk-gradient" : "text-ink"
          }`}
          style={{ textShadow, letterSpacing }}
        >
          {text}
        </motion.p>
      </motion.div>
    </div>
  );
});

/** 沉浸式歌词：整段随滚动推进，当前行居中高亮，其余渐隐 */
export default function LyricsAnimation() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // 行距需大于最高的行（强调行），否则相邻行会叠在一起
  const slotRem = isDesktop ? 10.2 : 7.6;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const focus = useTransform(
    scrollYProgress,
    [SNAP_START, SNAP_END],
    [0, TOTAL - 1],
    { clamp: true },
  );

  const railScale = useTransform(scrollYProgress, [SNAP_START, SNAP_END], [0, 1], {
    clamp: true,
  });

  /**
   * 吸附点：把「第 i 行正居中」对应的滚动位置换算成轨道内的像素偏移。
   *
   * 轨道高度来自 CSS（100svh + n×slot），其中 svh 与行距所用的单位在移动端
   * 并不相等，所以这里必须用实测高度，否则误差会随行号累积。
   */
  const [snap, setSnap] = useState<{ step: number; base: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      const trackH = el.offsetHeight;
      const scrollable = Math.max(1, trackH - window.innerHeight);
      const step = scrollable * (SNAP_END - SNAP_START) / (TOTAL - 1);
      const base = scrollable * SNAP_START;
      setSnap({ step, base });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [slotRem]);

  return (
    <section
      id="lyrics"
      ref={trackRef}
      className="lyrics-track relative"
      style={{ "--n": TOTAL - 1 } as React.CSSProperties}
    >
      {/* 吸附点：每个点只需「位置」，因此做成 1px 细线而非整屏高。
          整屏高的吸附点会让浏览器每帧做大量吸附匹配计算（实测移动端掉帧主因），
          1px 的定位成本几乎为零 */}
      {snap ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {lyrics.map((_, i) => (
            <span
              key={`snap-${i}`}
              className="absolute left-0 h-px w-px"
              style={{
                top: `${snap.base + snap.step * i}px`,
                scrollSnapAlign: "start",
              }}
            />
          ))}
        </div>
      ) : null}

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

        <div className="relative h-full w-full max-w-3xl">
          {lyrics.map((line, i) => (
            <LyricRow
              key={`${i}-${line.text}`}
              index={i}
              focus={focus}
              text={line.text}
              emphasis={Boolean(line.emphasis)}
              reduced={reduced}
              slotRem={slotRem}
              rich={isDesktop && !reduced}
            />
          ))}
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
