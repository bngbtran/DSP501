import type { GenreResultProps } from "@/lib/audio-ui";

type Props = GenreResultProps & {
  title?: string;
};

export function GenreResult({ title, genre, confidence }: Props) {
  if (!genre || confidence == null) return null;

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
    <div className="space-y-3">
      {title && <p className="text-lg font-bold text-lime-400">{title}</p>}

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
    </div>
  );
}
