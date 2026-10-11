import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 治愈系环境音：用 Web Audio 合成，无需外部音频文件。
 * 缓慢流动的和弦 + 轻混响感的长音，默认静音。
 */
export function useAmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.32);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    }
    setPlaying(false);
  }, []);

  /** 一次「拨弦」：三角波 + 缓慢包络，柔和如钢琴 */
  const pluck = useCallback(
    (freq: number, at: number, dur: number, gain: number) => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;

      const osc = ctx.createOscillator();
      const partial = ctx.createOscillator();
      const env = ctx.createGain();
      const tone = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.value = freq;
      partial.type = "sine";
      partial.frequency.value = freq * 2.003;

      tone.type = "lowpass";
      tone.frequency.value = 2100;
      tone.Q.value = 0.4;

      const partialGain = ctx.createGain();
      partialGain.gain.value = 0.28;

      env.gain.setValueAtTime(0.0001, at);
      env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), at + 0.9);
      env.gain.exponentialRampToValueAtTime(0.0001, at + dur);

      osc.connect(tone);
      partial.connect(partialGain).connect(tone);
      tone.connect(env).connect(master);

      osc.start(at);
      partial.start(at);
      osc.stop(at + dur + 0.1);
      partial.stop(at + dur + 0.1);
    },
    [],
  );

  const start = useCallback(async () => {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    if (!ctxRef.current) {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0;

      // 低通 + 轻微延迟，营造空旷的厅堂感
      const soft = ctx.createBiquadFilter();
      soft.type = "lowpass";
      soft.frequency.value = 3200;

      const delay = ctx.createDelay(1.2);
      delay.delayTime.value = 0.42;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.26;
      const wet = ctx.createGain();
      wet.gain.value = 0.3;

      master.connect(soft).connect(ctx.destination);
      master.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(wet).connect(soft);

      ctxRef.current = ctx;
      masterRef.current = master;
    }

    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    if (ctx.state === "suspended") await ctx.resume();

    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.9);
    setPlaying(true);

    // F 大调附近的温暖进行：Fmaj7 - Am7 - Bb - C
    const chords: number[][] = [
      [174.61, 261.63, 329.63, 392.0],
      [220.0, 261.63, 329.63, 440.0],
      [233.08, 293.66, 349.23, 466.16],
      [261.63, 329.63, 392.0, 523.25],
    ];

    const playChord = () => {
      const c = ctxRef.current;
      if (!c) return;
      const notes = chords[stepRef.current % chords.length];
      stepRef.current += 1;
      const now = c.currentTime + 0.06;
      notes.forEach((f, i) => {
        pluck(f, now + i * 0.34, 5.4, i === 0 ? 0.1 : 0.062);
      });
    };

    playChord();
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(playChord, 5200);
  }, [pluck, volume]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else void start();
  }, [playing, start, stop]);

  useEffect(() => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (master && ctx) {
      master.gain.setTargetAtTime(
        playing ? volume : 0,
        ctx.currentTime,
        playing ? 0.35 : 0.25,
      );
    }
  }, [playing, volume]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      void ctxRef.current?.close();
      ctxRef.current = null;
      masterRef.current = null;
    },
    [],
  );

  return { playing, volume, setVolume, toggle };
}
