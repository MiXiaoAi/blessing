import { motion } from "framer-motion";

/** 顶部细线进度条 —— 显示「今天已经走过多少」 */
export default function DayProgress({ progress }: { progress: number }) {
  return (
    <motion.div
      className="day-progress"
      style={{ scaleX: progress }}
      aria-hidden="true"
    />
  );
}
