import { useEffect, useState } from "react";
import AudioUploader from "@/components/audio/AudioUploader";
import EqSliders from "@/components/dsp/EqSliders";
import WaveformCompare from "@/components/common/WaveformCompare";
import AudioPlayer from "@/components/audio/AudioPlayer";
import { GenreResult } from "@/components/ml/GenreResult";
import ExportAlert from "@/components/common/ExportAlert";
import type { Track } from "@/lib/audio";
import type { EQ } from "@/lib/eq";
import { applyEqualizer } from "@/lib/api/equalizer";
import SpectrumCompare from "@/components/common/SpectrumCompare";
import { analyzeAudio } from "@/lib/api/analyze";

export default function EqPage() {
  const [step, setStep] = useState<"input" | "mixing">("input");
  const [track, setTrack] = useState<Track | null>(null);

  const DEFAULT_EQ: EQ = {
    bass: 0,
    low_mid: 0,
    mid: 0,
    high_mid: 0,
    treble: 0,
    gain: 0,
  };

  const [eq, setEq] = useState<EQ>(DEFAULT_EQ);

  const updateBand = (id: string, value: number) =>
    setEq((prev) => ({ ...prev, [id]: value }));

  const [exportStatus, setExportStatus] = useState<
    "idle" | "exporting" | "done"
  >("idle");

  const [waveformProgress, setWaveformProgress] = useState(0);

  const [waveform, setWaveform] = useState<{
    original: number[];
    processed: number[];
  } | null>(null);

  const handleClearTrack = () => {
    setTrack(null);
    setEq(DEFAULT_EQ);
    setWaveform(null);
    setWaveformProgress(0);
    setExportStatus("idle");
    setStep("input");
  };

  const decodeAudioFromUrl = async (url: string) => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const audioCtx = new AudioContext();
    return await audioCtx.decodeAudioData(arrayBuffer);
  };

  const handleExport = async () => {
    if (!track?.originalFile) return;

    try {
      setExportStatus("exporting");
      setWaveformProgress(0);

      const res = await applyEqualizer({
        file: track.originalFile as File,
        bass: eq.bass,
        low_mid: eq.low_mid,
        mid: eq.mid,
        high_mid: eq.high_mid,
        treble: eq.treble,
        gain: eq.gain,
      });

      setWaveform({
        original: res.waveform.original,
        processed: res.waveform.processed,
      });

      const processedUrl = `${import.meta.env.VITE_API_URL}${res.download_url}`;

      const processedBuffer = await decodeAudioFromUrl(processedUrl);

      setTrack((prev) =>
        prev
          ? {
              ...prev,
              processedUrl,
              processedAudioBuffer: processedBuffer,
            }
          : prev,
      );

      const link = document.createElement("a");
      link.href = processedUrl;
      link.download = `mixed_${track.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTrack((prev) => (prev ? { ...prev, processedUrl } : prev));

      setWaveformProgress(1);
      setExportStatus("done");

      setTimeout(() => setExportStatus("idle"), 2000);
    } catch (err) {
      console.error(err);
      setExportStatus("idle");
      alert("Export failed!");
    }
  };

  useEffect(() => {
    if (exportStatus !== "exporting") return;

    const id = setInterval(() => {
      setWaveformProgress((p) => {
        const next = p + 0.02;
        return next >= 1 ? 1 : next;
      });
    }, 80);

    return () => clearInterval(id);
  }, [exportStatus]);

  return (
    <div className="space-y-10 p-8">
      {step === "input" && (
        <AudioUploader
          title="EQUALIZER"
          onAudioReady={async ({ file, name, audioBuffer }) => {
            const url = URL.createObjectURL(file);

            setTrack({
              id: crypto.randomUUID(),
              name,
              status: "processing",
              originalUrl: url,
              originalFile: file,
              audioBuffer,
              genre: "Detecting...",
              confidence: 0,
            });

            setStep("mixing");

            try {
              const result = await analyzeAudio(file, DEFAULT_EQ);

              setTrack((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "done",
                      genre: result.classification.genre.toUpperCase(),
                      confidence: result.classification.confidence,
                    }
                  : prev,
              );
            } catch (err) {
              console.error(err);

              setTrack((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "done",
                      genre: "Unknown",
                      confidence: 0,
                    }
                  : prev,
              );
            }
          }}
        />
      )}

      {step === "mixing" && track && (
        <>
          <GenreResult
            title={track.name}
            genre={track.genre}
            confidence={track.confidence}
          />

          {exportStatus !== "idle" && (
            <ExportAlert
              status={exportStatus}
              title={
                exportStatus === "exporting"
                  ? "Exporting audio"
                  : "Export complete"
              }
              description={
                exportStatus === "exporting"
                  ? "Please wait while your track is being processed…"
                  : "Your mixed track has been downloaded"
              }
            />
          )}

          <AudioPlayer
            url={track.originalUrl!}
            title={track.name}
            eq={eq}
            onClear={handleClearTrack}
            onExport={handleExport}
          />

          <EqSliders values={eq} onChange={updateBand} />

          {waveform && (
            <WaveformCompare
              original={waveform.original}
              processed={waveform.processed}
              progress={waveformProgress}
              showAlert={exportStatus !== "idle"}
            >
              <ExportAlert
                status={exportStatus}
                title={
                  exportStatus === "exporting"
                    ? "Rendering waveform"
                    : "Waveform ready"
                }
                description={
                  exportStatus === "exporting"
                    ? "Generating waveform data…"
                    : "Waveform rendering complete"
                }
              />
            </WaveformCompare>
          )}

          {track.audioBuffer && (
            <SpectrumCompare
              original={track.audioBuffer}
              processed={track.processedAudioBuffer}
              showAlert={exportStatus === "exporting"}
            >
              <ExportAlert
                status={exportStatus}
                title="Rendering spectrum"
                description="Analyzing frequency response…"
              />
            </SpectrumCompare>
          )}
        </>
      )}
    </div>
  );
}
