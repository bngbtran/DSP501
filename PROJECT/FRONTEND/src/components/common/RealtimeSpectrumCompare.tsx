import RealtimeSpectrumView from "../visualize/RealtimeSpectrumView";

type Props = {
  original: AnalyserNode;
  processed?: AnalyserNode;
  showAlert?: boolean;
  children?: React.ReactNode;
};

export default function RealtimeSpectrumCompare({
  original,
  processed,
  showAlert = false,
  children,
}: Props) {
  return (
    <div className="relative rounded-xl p-4 min-h-[260px]">
      {!showAlert && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RealtimeSpectrumView
            title="ORIGINAL SPECTRUM (FFT)"
            analyser={original}
          />

          {processed && (
            <RealtimeSpectrumView
              title="PROCESSED SPECTRUM (FFT)"
              analyser={processed}
            />
          )}
        </div>
      )}

      {showAlert && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
