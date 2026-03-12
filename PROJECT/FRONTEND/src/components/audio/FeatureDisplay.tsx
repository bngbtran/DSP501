import { useEffect, useRef } from "react";
import type { AudioFeatures, ClassificationResult } from "@/lib/api/analyze";

type Props = {
  features: AudioFeatures;
  spectrum: {
    original: { freqs: number[]; magnitude: number[] };
    processed: { freqs: number[]; magnitude: number[] };
  };
  waveform: {
    original: number[];
    processed: number[];
  };
  classification?: ClassificationResult;
  eqSettings?: {
    bass: number;
    low_mid: number;
    mid: number;
    high_mid: number;
    treble: number;
    gain: number;
  };
};

function BarChart({
  data,
  labels,
  title,
  color = "#84cc16",
}: {
  data: number[];
  labels: string[];
  title: string;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...data.map(Math.abs), 1e-6);
    const barW = width / data.length - 2;
    const midY = height / 2;

    data.forEach((val, i) => {
      const barH = (Math.abs(val) / maxVal) * (height / 2 - 10);
      const x = i * (barW + 2) + 1;
      const y = val >= 0 ? midY - barH : midY;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barW, barH);
      ctx.fillStyle = "#888";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labels[i] ?? "", x + barW / 2, height - 2);
    });

    ctx.strokeStyle = "#444";
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
  }, [data, labels, color]);

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/50">
        {title}
      </p>
      <canvas
        ref={canvasRef}
        width={400}
        height={140}
        className="w-full rounded-lg bg-[#0a0f1c]"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-[#0a0f1c] px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-lime-400">{String(value)}</p>
    </div>
  );
}

function WaveformMini({ data }: { data: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barW = width / data.length;
    const mid = height / 2;

    ctx.fillStyle = "#84cc16";
    data.forEach((v, i) => {
      const h = v * mid * 0.9;
      ctx.fillRect(i * barW, mid - h, Math.max(barW - 0.5, 0.5), h * 2);
    });
  }, [data]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={160}
        className="w-full rounded-lg bg-[#0a0f1c]"
      />
    </div>
  );
}

function SpectrumMini({
  freqs,
  magnitude,
}: {
  freqs: number[];
  magnitude: number[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const minDb = -80;
    const maxDb = 0;
    const minFreq = 20;
    const maxFreq = 20000;
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);

    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < freqs.length; i++) {
      const f = freqs[i];
      if (f < minFreq || f > maxFreq) continue;
      const x = ((Math.log10(f) - logMin) / (logMax - logMin)) * width;
      const db = Math.max(minDb, Math.min(maxDb, magnitude[i]));
      const y = height - ((db - minDb) / (maxDb - minDb)) * height;
      points.push({ x, y });
    }

    if (points.length < 2) return;

    ctx.strokeStyle = "#84cc16";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 0.5;
    const ticks = [100, 1000, 10000];
    ticks.forEach((f) => {
      const x = ((Math.log10(f) - logMin) / (logMax - logMin)) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillStyle = "#555";
      ctx.font = "9px sans-serif";
      ctx.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x + 2, height - 4);
    });
  }, [freqs, magnitude]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={160}
        className="w-full rounded-lg bg-[#0a0f1c]"
      />
    </div>
  );
}

function ClassificationBadge({ genre, confidence }: ClassificationResult) {
  const pct = (confidence * 100).toFixed(1);

  const ring =
    confidence >= 0.8
      ? "ring-lime-400/60"
      : confidence >= 0.5
        ? "ring-yellow-400/60"
        : "ring-red-400/60";

  const textColor =
    confidence >= 0.8
      ? "text-lime-400"
      : confidence >= 0.5
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div
      className={`flex items-center gap-4 rounded-xl bg-[#0a0f1c] px-5 py-4 ring-2 ${ring}`}
    >
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-wider text-white/40">
          ML Genre Classification
        </p>
        <p className="mt-1 text-2xl font-extrabold uppercase text-white">
          {genre}
        </p>
      </div>

      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${confidence * 100} ${100 - confidence * 100}`}
            className={textColor}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xs font-bold ${textColor}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export default function FeatureDisplay({
  features,
  spectrum,
  waveform,
  classification,
}: Props) {
  const { metadata, mfcc, spectral, rhythm, energy, chroma } = features;

  return (
    <div className="space-y-6">
      {classification && (
        <section>
          <ClassificationBadge
            genre={classification.genre}
            confidence={classification.confidence}
          />
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">
          Audio Metadata
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Duration" value={`${metadata.duration_seconds}s`} />
          <Stat label="Sample Rate" value={`${metadata.sample_rate} Hz`} />
          <Stat label="Samples" value={metadata.num_samples.toLocaleString()} />
          <Stat label="Tempo" value={`${rhythm.tempo_bpm} BPM`} />
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">
              Waveform
            </h3>
            <WaveformMini data={waveform.original} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">
              Spectrum
            </h3>
            <SpectrumMini
              freqs={spectrum.original.freqs}
              magnitude={spectrum.original.magnitude}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">
          Spectral Features
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Centroid" value={`${spectral.centroid} Hz`} />
          <Stat label="Bandwidth" value={`${spectral.bandwidth} Hz`} />
          <Stat label="Rolloff" value={`${spectral.rolloff} Hz`} />
          <Stat label="Flatness" value={spectral.flatness} />
          <Stat label="Zero Crossing" value={energy.zero_crossing_rate} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">
          Energy
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="RMS Mean" value={energy.rms_mean} />
          <Stat label="RMS Max" value={energy.rms_max} />
          <Stat label="Beat Count" value={rhythm.beat_count} />
          <Stat label="Tempo" value={`${rhythm.tempo_bpm} BPM`} />
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-[200px] rounded-2xl bg-[#0a0f1c] p-">
            <BarChart
              data={mfcc.coefficients}
              labels={mfcc.labels}
              title="MFCC Coefficients"
              color="#84cc16"
            />
          </div>

          <div className="h-[200px] rounded-2xl bg-[#0a0f1c] p-3">
            <BarChart
              data={chroma.values}
              labels={chroma.labels}
              title="Chroma Features"
              color="#22d3ee"
            />
          </div>

          <div className="h-[200px] rounded-2xl bg-[#0a0f1c] p-3">
            <BarChart
              data={spectral.contrast}
              labels={spectral.contrast.map((_, i) => `B${i + 1}`)}
              title="Spectral Contrast"
              color="#a78bfa"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
