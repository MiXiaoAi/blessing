export type RGB = readonly [number, number, number];

export function hex(value: string): RGB {
  const v = value.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  const k = Math.min(1, Math.max(0, t));
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

export function rgb(c: RGB, alpha = 1): string {
  const r = Math.round(c[0]);
  const g = Math.round(c[1]);
  const b = Math.round(c[2]);
  return alpha >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 把 0..1 映射到「第几段」以及段内比例 */
export function segment(count: number, progress: number) {
  const scaled = clamp01(progress) * (count - 1);
  const index = Math.min(count - 2, Math.floor(scaled));
  return { index, t: scaled - index };
}
