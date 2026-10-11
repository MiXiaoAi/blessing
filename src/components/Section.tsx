import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useInViewOnce } from "../hooks/useInViewOnce";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type Props = {
  /** 小节序号，如 "01" */
  step: string;
  /** 小节英文名，与中文标题形成对照 */
  label: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * 章节外壳：负责统一的纵向留白、编号标记与渐入节奏。
 * 各互动模块只关心自己的内容。
 */
export default function Section({
  step,
  label,
  title,
  description,
  children,
  className = "",
}: Props) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const d = (v: number) => (reduced ? 0 : v);

  return (
    <section
      ref={ref}
      className={`relative px-5 py-28 sm:px-8 sm:py-36 lg:py-44 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl">
        <motion.header
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: d(24) }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: d(1.3), ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="flex items-center gap-3 text-[0.66rem] tracking-[0.34em] text-ink-faint">
            <span className="font-serif text-sun">{step}</span>
            <span className="h-px w-8 bg-ink-faint/45" />
            <span className="uppercase">{label}</span>
          </span>

          <h2 className="mt-7 font-serif text-[clamp(1.6rem,4.4vw,2.75rem)] leading-[1.44] font-light tracking-[0.035em] text-ink">
            {title}
          </h2>

          {description ? (
            <p className="mt-6 max-w-[34rem] text-[0.93rem] leading-[2.05] text-ink-soft">
              {description}
            </p>
          ) : null}
        </motion.header>

        <div className="mt-16 sm:mt-20">{children}</div>
      </div>
    </section>
  );
}
