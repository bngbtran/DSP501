import { useEffect, useRef } from "react";

type Props = {
  title: string;
  analyser: AnalyserNode;
};

export default function RealtimeSpectrumView({ title, analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const buffer = new Float32Array(analyser.frequencyBinCount);
    let raf = 0;

    const draw = () => {
      analyser.getFloatFrequencyData(buffer);

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 1.6;

      const minDb = analyser.minDecibels;
      const maxDb = analyser.maxDecibels;
      const nyquist = analyser.context.sampleRate / 2;

      for (let x = 0; x < width; x++) {
        const logMin = Math.log10(20);
        const logMax = Math.log10(nyquist);
        const logFreq = logMin + (x / width) * (logMax - logMin);
        const freq = Math.pow(10, logFreq);

        const index = Math.floor((freq / nyquist) * buffer.length);

        const db = buffer[index] ?? minDb;
        const norm = (db - minDb) / (maxDb - minDb);
        const y = height - norm * height;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-white/70">{title}</p>
      <canvas
        ref={canvasRef}
        width={420}
        height={220}
        className="w-full rounded-md border border-white/10"
      />
    </div>
  );
}
