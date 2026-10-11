import { useCallback, useState } from "react";
import { motion, useTransform } from "framer-motion";
import Atmosphere from "./components/Atmosphere";
import BlessingCard from "./components/BlessingCard";
import DailyReminder from "./components/DailyReminder";
import DayProgress from "./components/DayProgress";
import FooterMessage from "./components/FooterMessage";
import HeroSection from "./components/HeroSection";
import LyricsAnimation from "./components/LyricsAnimation";
import MusicControl from "./components/MusicControl";
import Section from "./components/Section";
import SmileInteraction from "./components/SmileInteraction";
import { usePageProgress } from "./hooks/usePageProgress";

/**
 * 「写给今天的你」
 *
 * 整页是一条「一天的光」时间线：
 * Hero（清晨）→ 歌词（上午到午后）→ 三个互动模块（午后）
 * → 夜间提醒（黄昏）→ 结尾（落日）
 */
export default function App() {
  const progress = usePageProgress();
  const [entered, setEntered] = useState(false);

  const enter = useCallback(() => {
    setEntered(true);
    document
      .getElementById("lyrics")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <DayProgress progress={progress} />
      <Atmosphere />
      <MusicControl />

      <main className="relative">
        <HeroSection onEnter={enter} />

        <LyricsAnimation />

        <Section
          step="01"
          label="Blessing"
          title="有一句祝福，刚好在等你"
          description="有些祝福不需要理由，只是想对你说。抽一张，收下就好。"
        >
          <BlessingCard />
        </Section>

        <Section
          step="02"
          label="Smile"
          title="好好打扮你的微笑很灿烂"
          description="微笑是会回传的。你按下它的那一刻，它也在轻轻抱住你。"
        >
          <SmileInteraction />
        </Section>

        <Section
          step="03"
          label="Tonight"
          title="要吃的饱一点睡的早一点"
          description="今天的小目标不用很大，能照顾好自己的地方，都值得被记下来。"
        >
          <DailyReminder />
        </Section>

        <FooterMessage />
      </main>

      {/* 进入歌词区之后，底部留一个回到清晨的入口。
          用 MotionValue 驱动透明度而非条件渲染，避免滚动时反复挂载/卸载 */}
      {entered ? <BackToMorning /> : null}
    </>
  );
}

function BackToMorning() {
  const progress = usePageProgress();
  const opacity = useTransform(progress, [0.02, 0.1], [0, 1]);

  return (
    <motion.button
      type="button"
      onClick={() =>
        document
          .getElementById("hero")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      style={{ opacity }}
      className="glass fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-[0.7rem] tracking-[0.22em] text-ink-soft transition-colors duration-500 hover:text-ink sm:bottom-8"
    >
      回到清晨
    </motion.button>
  );
}
