import { useEffect, useRef } from "react";

type Props = {
  title: string;
  data: number[];
  progress?: number;
};

export function WaveformView({ title, data, progress = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;

    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#84ff00";
    ctx.lineWidth = 1;
    ctx.beginPath();

    const visible = Math.floor(data.length * progress);
    const step = w / data.length;

    for (let i = 0; i < visible; i++) {
      const amp = data[i];
      const x = i * step;
      const y = amp * mid;

      ctx.moveTo(x, mid - y);
      ctx.lineTo(x, mid + y);
    }

    ctx.stroke();
  }, [data, progress]);

  return (
    <div className="space-y-2">
      <p className="text-sm text-white font-medium">{title}</p>
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full rounded-md border border-white/10 bg-black/30"
      />
    </div>
  );
}
