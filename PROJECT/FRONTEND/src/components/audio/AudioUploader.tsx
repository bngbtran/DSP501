import { useRef, useState, useEffect } from "react";
import FileDropzone from "@/components/audio/FileDropZone";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, Mic, CheckCircle, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadStatus } from "@/lib/audio";

type Props = {
  title?: string;
  onAudioReady: (payload: {
    file: File | Blob;
    name: string;
    audioBuffer: AudioBuffer;
  }) => void;
};

export default function AudioUploader({ title = "", onAudioReady }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const decodeAudio = async (file: File | Blob) => {
    const audioCtx = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();
    return audioBuffer;
  };

  const startUpload = (file: File | Blob, name: string) => {
    setFileName(name);
    setStatus("uploading");
    setProgress(0);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100 && !hasFinishedRef.current) {
          hasFinishedRef.current = true;

          if (timerRef.current) clearInterval(timerRef.current);

          setStatus("processing");
          (async () => {
            const audioBuffer = await decodeAudio(file);
            setStatus("complete");
            onAudioReady({ file, name, audioBuffer });
          })();

          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const startRecord = async () => {
    reset();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType,
      });

      const audioFile = new File([blob], `recording_${Date.now()}.webm`, {
        type: recorder.mimeType,
      });

      startUpload(audioFile, audioFile.name);
    };

    recorder.start();
    setStatus("recording");
  };

  const stopRecord = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach((track) => track.stop());
  };

  const reset = () => {
    hasFinishedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setFileName(null);
    setProgress(0);
    setStatus("idle");
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      {title && (
        <h2 className="mb-4 text-center text-xl font-bold text-lime-400">
          {title}
        </h2>
      )}

      <Tabs defaultValue="upload">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Audio
          </TabsTrigger>

          <TabsTrigger value="record" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Record
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4 space-y-4">
          <div className="rounded-xl border border-dashed border-cyan-400/50 p-6 text-center">
            <FileDropzone
              mode="upload"
              accept={{
                "audio/mpeg": [".mp3"],
                "audio/wav": [".wav"],
              }}
              maxFiles={1}
              status={status}
              progress={progress}
              fileName={fileName}
              onDrop={(files) => {
                if (files.length > 0) {
                  reset();
                  startUpload(files[0], files[0].name);
                }
              }}
            />
          </div>

          {fileName && (
            <p className="flex items-center justify-center gap-1 text-sm text-lime-400">
              <CheckCircle className="h-4 w-4" />
              Uploaded: {fileName}
            </p>
          )}
        </TabsContent>

        <TabsContent
          value="record"
          className="mt-6 space-y-4 flex flex-col items-center"
        >
          <div className="w-full rounded-xl border border-dashed border-cyan-400/50 p-6 text-center">
            <FileDropzone
              mode="record"
              status={status}
              progress={progress}
              isRecording={status === "recording"}
              hasRecording={status === "processing" || status === "complete"}
            />
          </div>

          {status === "processing" ? (
            <Button
              disabled
              className="flex items-center gap-2 bg-gray-500 text-white"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </Button>
          ) : status !== "recording" ? (
            <Button
              onClick={startRecord}
              className="bg-lime-400 text-blue-950 shadow-[0_4px_20px_rgba(182,255,82,0.35)] transition-all duration-200 hover:bg-lime-300 active:scale-95"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecord}
              className="bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.45)] hover:bg-red-400 active:bg-red-600 active:scale-95 transition-all duration-200"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {status === "recording" && (
            <p className="text-sm text-red-400 animate-pulse">● Recording...</p>
          )}

          {status === "processing" && (
            <p className="text-sm text-lime-400">Analyzing recorded audio…</p>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
