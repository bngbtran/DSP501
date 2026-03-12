import EqFader from "./EqFader";
import type { EQ } from "@/lib/eq";

type Band = {
  id: keyof EQ;
  label: string;
  freq: string;
};

const BANDS: Band[] = [
  { id: "bass", label: "BASS", freq: "100 Hz" },
  { id: "low_mid", label: "LOW MID", freq: "250 Hz" },
  { id: "mid", label: "MID", freq: "1 kHz" },
  { id: "high_mid", label: "HIGH MID", freq: "3.2 kHz" },
  { id: "treble", label: "TREBLE", freq: "6.4 kHz" },
  { id: "gain", label: "GAIN", freq: "dB" },
];

type Props = {
  values: EQ;
  onChange: (id: keyof EQ, value: number) => void;
};

export default function EqFaderGroup({ values, onChange }: Props) {
  return (
    <div className="flex justify-between gap-6">
      {BANDS.map((band) => (
        <EqFader
          key={band.id}
          label={band.label}
          freq={band.freq}
          value={values[band.id]}
          onChange={(v: number) => onChange(band.id, v)}
        />
      ))}
    </div>
  );
}
