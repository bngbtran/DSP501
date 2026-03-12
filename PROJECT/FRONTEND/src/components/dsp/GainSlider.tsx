import { Slider } from "@/components/ui/slider";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export function GainSlider({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-white">Volume</p>

      <Slider
        min={0}
        max={2}
        step={0.01}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        className="
                    [&_[role=track]]:h-2 cursor-pointer
                    [&_[role=track]]:bg-white/20
                    [&_[role=range]]:bg-lime-400
                    [&_[role=slider]]:bg-lime-400
                    [&_[role=slider]]:border-none
                    [&_[role=slider]]:h-4
                    [&_[role=slider]]:w-4
                "
      />

      <p className="text-xs text-white/60">{value.toFixed(2)}</p>
    </div>
  );
}
