import { useEffect, useRef } from "react";
import { computeFFT_Averaged } from "@/lib/audio-visual";

type Props = {
  title: string;
  audioBuffer: AudioBuffer;
};

const MIN_DB = -80;
const MAX_DB = 0;
const MIN_FREQ = 20;
const MAX_FREQ = 20000;

export default function SpectrumView({ title, audioBuffer }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#888";

    for (let db = MIN_DB; db <= MAX_DB; db += 20) {
      const y = height - ((db - MIN_DB) / (MAX_DB - MIN_DB)) * height;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillText(`${db} dB`, 4, y - 2);
    }

    const freqTicks = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    const logMin = Math.log10(MIN_FREQ);
    const logMax = Math.log10(MAX_FREQ);

    freqTicks.forEach((freq) => {
      const x = ((Math.log10(freq) - logMin) / (logMax - logMin)) * width;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillText(label, x + 2, height - 4);
    });

    const signal = audioBuffer.getChannelData(0);
    const spectrum = computeFFT_Averaged(signal);

    ctx.strokeStyle = "#84ff00";
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    spectrum.forEach((db, i) => {
      const freq = (i / spectrum.length) * (audioBuffer.sampleRate / 2);
      if (freq < MIN_FREQ || freq > MAX_FREQ) return;

      const x = ((Math.log10(freq) - logMin) / (logMax - logMin)) * width;

      const clampedDb = Math.max(MIN_DB, Math.min(MAX_DB, db));
      const y = height - ((clampedDb - MIN_DB) / (MAX_DB - MIN_DB)) * height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [audioBuffer]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white">{title}</p>

      <canvas
        ref={canvasRef}
        width={800}
        height={260}
        className="w-full rounded-md border border-white/10 bg-black/30"
      />
    </div>
  );
}
