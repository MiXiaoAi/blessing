# 把一句祝福，变成一次温暖的相遇

一首会呼吸的祝福歌曲网页。用户滑动页面时，背景色温从清晨冷蓝连续过渡到黄昏橙金——整页是一条「一天的光」时间线。

## 技术栈

React 18 · TypeScript（strict）· Vite 6 · Tailwind CSS 4 · Framer Motion 11

## 运行

```bash
bun install     # 或 npm install
bun run dev     # 开发，默认 http://127.0.0.1:5178
bun run build   # 生产构建 → dist/
bun run preview # 预览构建产物
```

## 页面结构

| 区块 | 组件 | 内容 |
| --- | --- | --- |
| 清晨 | `HeroSection` | 核心文案「希望你会对自己好一点」+ 进入按钮 |
| 歌词 | `LyricsAnimation` | 滚动驱动的沉浸式歌词，四句重点句金色渐变高亮 |
| 01 | `BlessingCard` | 翻牌抽祝福，光晕 + 爱心粒子 |
| 02 | `SmileInteraction` | 微笑按钮，彩色光点 + 飘落星星 |
| 03 | `DailyReminder` | 今日小目标勾选，全部完成触发彩纸庆祝 |
| 结尾 | `FooterMessage` | 夕阳渐变 + 呼吸文字 |

常驻组件：`Atmosphere`（天空/太阳/云/阳光尘埃）、`DayProgress`（顶部细线进度）、`MusicControl`（背景音乐）。

## 目录

```
src/
├─ components/        页面区块与常驻组件
├─ hooks/
│  ├─ usePageProgress.ts         rAF 节流读取滚动进度
│  ├─ useInViewOnce.ts           进入视口触发一次
│  ├─ usePrefersReducedMotion.ts 尊重系统减弱动效
│  └─ useAmbientMusic.ts         Web Audio 合成治愈和弦
├─ lib/color.ts       颜色插值与分段工具
├─ data/content.ts    全部文案与祝福语（改文案只动这里）
└─ styles/index.css   设计 token、组件类、关键帧
```

## 设计说明

**配色**：米白纸感底 `#FDFAF4`，暖褐墨色 `#3A332C`（不用纯黑），暖黄 `#F2B441`、夕阳橙 `#F0864E`、晨蓝 `#A8C8DE`、一点绿 `#8FAC7E`。

**字体**：Inter + 思源黑体 / PingFang SC；歌词与标题用衬线（Noto Serif SC）拉出情绪层次。

**动效节奏**：统一走慢速缓动 `cubic-bezier(0.22, 1, 0.36, 1)`，时长多在 1–1.7s；循环动画周期 6–11s，制造呼吸感。

## 可访问性

- 所有交互元素为原生 `button`，支持键盘 Tab 聚焦与 `:focus-visible` 描边。
- 勾选项使用 `aria-pressed`，音乐按钮使用 `aria-pressed` + `aria-label`。
- `prefers-reduced-motion: reduce` 下关闭装饰性循环动画与粒子，内容保持可见、交互保持可用。

## 背景音乐

`useAmbientMusic` 用 Web Audio 实时合成（三角波 + 慢包络 + 延迟反馈），无需外部音频文件。F–Am–Bb–C 温暖进行，默认静音，首次点击才创建音频上下文。

## 说明

- 歌词区用 `position: sticky` + `useScroll` 驱动，轨道高度由 `--n`（行数）与 `--lyric-slot`（每行占用视口比例）计算。
- `html` 用 `overflow-x: clip` 而非 `hidden`：裁掉装饰性粒子的横向溢出，同时不破坏 sticky。
- 装饰粒子（云朵、尘埃、爱心）的越界是设计意图，会被视口裁切。
