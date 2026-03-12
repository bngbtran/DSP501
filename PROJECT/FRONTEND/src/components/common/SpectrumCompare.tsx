import SpectrumView from "@/components/visualize/SpectrumView";

type Props = {
  original: AudioBuffer;
  processed?: AudioBuffer;
  showAlert?: boolean;
  children?: React.ReactNode;
};

export default function SpectrumCompare({
  original,
  processed,
  showAlert = false,
  children,
}: Props) {
  return (
    <div className="relative rounded-xl p-4 min-h-[260px]">
      {!showAlert && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SpectrumView
            title="ORIGINAL SPECTRUM (FFT)"
            audioBuffer={original}
          />

          {processed && (
            <SpectrumView
              title="PROCESSED SPECTRUM (FFT)"
              audioBuffer={processed}
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
