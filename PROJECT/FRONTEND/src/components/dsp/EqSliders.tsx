import EqFaderGroup from "./EqFaderGroup";
import type { EQ } from "@/lib/eq";

type Props = {
  values: EQ;
  onChange: (id: keyof EQ, value: number) => void;
};

export default function EqSliders({ values, onChange }: Props) {
  return (
    <div className="rounded-2xl bg-black/30 p-8 backdrop-blur">
      <EqFaderGroup values={values} onChange={onChange} />
    </div>
  );
}
