import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";

/** 顶部细线进度条 —— 显示「今天已经走过多少」 */
export default function DayProgress({ progress }: { progress: MotionValue<number> }) {
  return (
    <motion.div
      className="day-progress"
      style={{ scaleX: progress }}
      aria-hidden="true"
    />
  );
}
