import { WaveformView } from "../visualize/WaveformView";

type Props = {
  original: number[];
  processed: number[];
  progress?: number;
  showAlert?: boolean;
  children?: React.ReactNode;
};

export default function WaveformCompare({
  original,
  processed,
  progress = 1,
  showAlert = false,
  children,
}: Props) {
  return (
    <div className="relative rounded-xl p-4 min-h-[160px]">
      <div
        className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${
          showAlert ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <WaveformView title="ORIGINAL" data={original} progress={1} />

        <WaveformView title="AFTER EQ" data={processed} progress={progress} />
      </div>

      {showAlert && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
