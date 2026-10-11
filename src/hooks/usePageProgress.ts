import { useEffect, useRef, useState } from "react";

/**
 * 用 rAF 节流读取滚动进度，避免 scroll 事件高频触发导致的抖动。
 * progress: 0 = 页面顶部，1 = 页面底部
 */
export function usePageProgress() {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const read = () => {
      frame.current = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return progress;
}
