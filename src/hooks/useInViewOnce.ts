import { useEffect, useRef, useState } from "react";

/** 元素进入视口时触发一次，用于「渐入」类动画 */
export function useInViewOnce<T extends HTMLElement>(
  rootMargin = "0px 0px -18% 0px",
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
