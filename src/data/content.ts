/**
 * 页面文案集中管理。
 * 歌词里的「你的心情好一点，emo少一点」等四句为视觉重点，用 emphasis 标记。
 */

export type LyricLine = {
  text: string;
  /** 重点句：字号更大、暖金渐变、带光晕 */
  emphasis?: boolean;
};

export const hero = {
  kicker: "把一句祝福，变成一次温暖的相遇",
  title: "希望你会对自己好一点",
  subtitle: "今天也要好好生活呀",
  cta: "打开今日祝福",
  scrollHint: "轻轻往下滑",
};

export const lyrics: LyricLine[] = [
  { text: "每天好像都在原地转圈圈" },
  { text: "闹钟响了七点，梦还留在很远的地方" },
  { text: "你已经很努力了，只是没有人这样告诉你" },
  { text: "你的心情好一点，emo少一点", emphasis: true },
  { text: "把昨天的疲惫，就留在昨天" },
  { text: "让运气好一点，烦恼少一点", emphasis: true },
  { text: "你值得被生活，轻轻拥抱一下" },
  { text: "阳光暖暖，它会照在你身边", emphasis: true },
  { text: "要吃的饱一点，睡的早一点" },
  { text: "好好打扮你的微笑，很灿烂" },
  { text: "希望你会对自己好一点", emphasis: true },
];

export const blessings = [
  "今天也辛苦啦，请记得奖励努力的自己。",
  "不开心的时候，也允许自己慢一点。",
  "你的存在，本身就是一件值得庆祝的事情。",
  "愿你的生活多一点阳光，少一点烦恼。",
  "不用一直坚强，你可以偶尔把心放下来。",
  "慢慢来，你已经比昨天更靠近想要的样子了。",
  "愿你今天走的每一步，都踩在温柔的路上。",
  "允许自己不完美，也允许自己被喜欢。",
  "你不需要成为谁，做你自己就已经很好了。",
  "记得多喝热水，也记得多抱抱自己。",
];

export const smileMessages = [
  "今天的你，也值得被温柔对待 ❤️",
  "你笑起来的样子，比今天的阳光还要好。",
  "这个微笑，已经寄给明天的你了。",
  "愿你每一次弯起嘴角，都正好有人看见。",
  "微笑是一种很温柔的超能力，你刚刚用了一次。",
];

export const reminders = [
  { id: "eat", label: "好好吃饭", hint: "哪怕只是给自己煮一碗面" },
  { id: "sleep", label: "少熬夜", hint: "十一点，把手机放远一点" },
  { id: "smile", label: "保持微笑", hint: "你笑起来真的很好看" },
  { id: "gentle", label: "对自己温柔一点", hint: "像对待最好的朋友那样" },
];

export const footer = {
  eyebrow: "日落之前，再说一句",
  poem: "愿你每天醒来，\n都有重新开始的勇气。",
  closing: "愿你幸福一点，快乐多一点。",
  signature: "— 送给今天的你",
};

export const musicHint = "治愈钢琴 · 默认静音";
