import { useState } from "react";
import AudioUploader from "@/components/audio/AudioUploader";
import FeatureDisplay from "@/components/audio/FeatureDisplay";
import { analyzeAudio, type AnalyzeResponse } from "@/lib/api/analyze";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyzePage() {
  const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudioReady = async ({
    file,
    name,
  }: {
    file: File | Blob;
    name: string;
    audioBuffer: AudioBuffer;
  }) => {
    try {
      setStep("analyzing");
      setError(null);

      const audioFile =
        file instanceof File
          ? file
          : new File([file], name, { type: file.type });

      const res = await analyzeAudio(audioFile);

      setResult(res);
      setStep("result");
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
      setStep("upload");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 p-8">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {step === "upload" && (
        <AudioUploader title="ANALYZER" onAudioReady={handleAudioReady} />
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <Loader2 className="h-10 w-10 animate-spin text-lime-400" />
          <p className="text-sm text-white/60">
            Analyzing audio and extracting features…
          </p>
        </div>
      )}

      {step === "result" && result && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-lime-400">
              <span className="text-white">File name: </span>
              {result.filename}
            </span>

            <Button
              size="sm"
              onClick={handleReset}
              className="
                gap-1.5
                bg-lime-400
                text-blue-950
                hover:bg-lime-300
                border border-lime-300
                shadow-[0_4px_20px_rgba(182,255,82,0.35)]
                transition-all
                duration-200
                active:scale-95
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Return
            </Button>
          </div>

          <FeatureDisplay
            features={result.features}
            spectrum={result.spectrum}
            waveform={result.waveform}
            classification={result.classification}
            eqSettings={result.eq_settings}
          />
        </>
      )}
    </div>
  );
}
