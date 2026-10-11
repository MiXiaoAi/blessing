import { useScroll } from "framer-motion";
import type { MotionValue } from "framer-motion";

/**
 * 整页滚动进度（0 = 顶部，1 = 底部）。
 *
 * 返回 MotionValue 而非 state：滚动时由它直接驱动 motion 元素的样式，
 * 不触发 React 重渲染。若用 state，每帧都会重渲染整棵组件树
 * （含粒子、多层渐变、全部歌词行），移动端会明显掉帧。
 */
export function usePageProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}
