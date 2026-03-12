import { Slider } from "@/components/ui/slider";

type Props = {
  label: string;
  freq?: string;
  value: number;
  onChange: (v: number) => void;
};

export default function EqFader({ label, freq, value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className={`text-sm font-semibold ${
          value > 0
            ? "text-lime-400"
            : value < 0
              ? "text-red-400"
              : "text-white/60"
        }`}
      >
        {value > 0 && "+"}
        {value} dB
      </span>

      <div
        className="relative flex h-40 w-10 items-center justify-center cursor-pointer"
        onDoubleClick={() => onChange(0)}
        title="Double click to reset"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 rounded-full bg-white/20" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 bg-lime-400/70 shadow-[0_0_6px_rgba(163,230,53,0.9)]" />

        <Slider
          orientation="vertical"
          min={-12}
          max={12}
          step={1}
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          className="
            relative h-40 w-2 cursor-pointer
            [&_[role=track]]:w-2
            [&_[role=track]]:mx-auto
            [&_[role=track]]:bg-white/20
            [&_[role=range]]:bg-lime-400
            [&_[role=slider]]:bg-lime-400
            [&_[role=slider]]:border-none
            [&_[role=slider]]:-translate-x-1
            [&_[role=slider]]:left-1/2
          "
        />
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-white">{label}</p>
        {freq && <p className="text-[10px] text-white/50">{freq}</p>}
      </div>
    </div>
  );
}
