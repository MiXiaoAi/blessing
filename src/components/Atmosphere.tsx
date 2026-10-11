import { memo, useMemo } from "react";
import { hex, mix, rgb, segment } from "../lib/color";
import type { RGB } from "../lib/color";
import { usePageProgress } from "../hooks/usePageProgress";

/**
 * 「一天的光」——整页背景色温随滚动从清晨冷蓝过渡到黄昏橙金。
 * 这是全站的签名设计：用户滑动时能感到时间在走。
 */

type Phase = {
  /** 天顶色 */
  top: RGB;
  /** 地平线色 */
  horizon: RGB;
  /** 太阳 / 光晕色 */
  sun: RGB;
  /** 光晕强度 0..1 */
  glow: number;
};

const PHASES: Phase[] = [
  // 清晨：微凉的蓝
  { top: hex("#c3d8e6"), horizon: hex("#fdf3e2"), sun: hex("#ffe0a8"), glow: 0.55 },
  // 上午：明亮的米白
  { top: hex("#dbe8ee"), horizon: hex("#fdfaf4"), sun: hex("#ffd98a"), glow: 0.72 },
  // 正午：暖白透亮
  { top: hex("#e6ecec"), horizon: hex("#fffaf0"), sun: hex("#f2b441"), glow: 0.85 },
  // 午后：暖黄渐浓
  { top: hex("#e9e0cd"), horizon: hex("#fff0d6"), sun: hex("#f2b441"), glow: 0.95 },
  // 黄昏：橙金
  { top: hex("#e3c3a3"), horizon: hex("#fdd3a3"), sun: hex("#f0864e"), glow: 1 },
  // 入夜前：柔和的玫瑰橙
  { top: hex("#c9a894"), horizon: hex("#f6bf9c"), sun: hex("#e8756a"), glow: 0.8 },
];

type Mote = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
  opacity: number;
};

function makeMotes(count: number): Mote[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const r2 = ((i * 4507 + 7919) % 104729) / 104729;
    const r3 = ((i * 3253 + 1237) % 65537) / 65537;
    return {
      left: r * 100,
      size: 2 + r2 * 5,
      duration: 22 + r3 * 26,
      delay: -r * 40,
      dx: (r2 - 0.5) * 160,
      dy: -(120 + r3 * 260),
      opacity: 0.28 + r * 0.42,
    };
  });
}

const Cloud = memo(function Cloud({
  top,
  scale,
  duration,
  delay,
  opacity,
  blur,
}: {
  top: string;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
  blur: number;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top,
        left: 0,
        opacity,
        filter: `blur(${blur}px)`,
        animation: `cloud-drift ${duration}s linear ${delay}s infinite`,
      }}
    >
      <svg
        width={220 * scale}
        height={78 * scale}
        viewBox="0 0 220 78"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#fff6e8" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <g fill="url(#cl)">
          <ellipse cx="72" cy="46" rx="54" ry="26" />
          <ellipse cx="118" cy="36" rx="46" ry="30" />
          <ellipse cx="156" cy="50" rx="42" ry="22" />
          <ellipse cx="34" cy="54" rx="32" ry="18" />
        </g>
      </svg>
    </div>
  );
});

export default function Atmosphere() {
  const progress = usePageProgress();
  const { index, t } = useMemo(() => segment(PHASES.length, progress), [progress]);

  const a = PHASES[index];
  const b = PHASES[index + 1] ?? a;

  const top = mix(a.top, b.top, t);
  const horizon = mix(a.horizon, b.horizon, t);
  const sun = mix(a.sun, b.sun, t);
  const glow = a.glow + (b.glow - a.glow) * t;

  const motes = useMemo(() => makeMotes(26), []);

  return (
    <div
      className="grain pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* 天空底色 */}
      <div
        className="absolute inset-0 transition-colors duration-700 ease-linear"
        style={{
          background: `linear-gradient(178deg, ${rgb(top)} 0%, ${rgb(
            mix(top, horizon, 0.62),
          )} 46%, ${rgb(horizon)} 100%)`,
        }}
      />

      {/* 地平线处的暖光 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[62%]"
        style={{
          background: `radial-gradient(120% 100% at 50% 118%, ${rgb(
            sun,
            0.5 * glow,
          )} 0%, ${rgb(sun, 0.16 * glow)} 42%, transparent 72%)`,
        }}
      />

      {/* 太阳本体：随进度从左上方缓缓右移下沉 */}
      <div
        className="absolute animate-sun-pulse"
        style={{
          left: `${18 + progress * 60}%`,
          top: `${14 + progress * 34}%`,
          width: "clamp(120px, 22vw, 260px)",
          height: "clamp(120px, 22vw, 260px)",
          transform: "translate(-50%, -50%)",
          borderRadius: "999px",
          background: `radial-gradient(circle, ${rgb(
            mix(sun, hex("#ffffff"), 0.55),
            0.95,
          )} 0%, ${rgb(sun, 0.55)} 34%, ${rgb(sun, 0.14)} 62%, transparent 76%)`,
          filter: "blur(2px)",
        }}
      />

      {/* 漂浮的阳光尘埃 */}
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full"
          style={
            {
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              background: rgb(mix(sun, hex("#ffffff"), 0.42), 0.92),
              boxShadow: `0 0 ${m.size * 3}px ${rgb(sun, 0.6)}`,
              animation: `mote-rise ${m.duration}s linear ${m.delay}s infinite`,
              "--mote-dx": `${m.dx}px`,
              "--mote-dy": `${m.dy}px`,
              "--mote-opacity": m.opacity,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 云朵 */}
      <Cloud top="12%" scale={1.35} duration={118} delay={-30} opacity={0.5} blur={1.6} />
      <Cloud top="26%" scale={0.9} duration={164} delay={-96} opacity={0.38} blur={2.6} />
      <Cloud top="44%" scale={1.7} duration={206} delay={-12} opacity={0.3} blur={4} />
      <Cloud top="62%" scale={1.05} duration={148} delay={-70} opacity={0.26} blur={5} />

      {/* 微风：缓慢横扫的柔光条 */}
      <div
        className="absolute inset-x-0 top-1/4 h-40 animate-glow-pulse"
        style={{
          background: `linear-gradient(100deg, transparent, ${rgb(
            hex("#ffffff"),
            0.4,
          )}, transparent)`,
          filter: "blur(30px)",
        }}
      />

      {/* 底部渐隐，让内容落地 */}
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background: `linear-gradient(to top, ${rgb(horizon, 0.9)}, transparent)`,
        }}
      />
    </div>
  );
}
