import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import EqSliders from "@/components/dsp/EqSliders";
import WaveformCompare from "@/components/common/WaveformCompare";
import ExportAlert from "@/components/common/ExportAlert";
import RealtimeSpectrumCompare from "@/components/common/RealtimeSpectrumCompare";
import type { EQ } from "@/lib/eq";

function computeWaveform(signal: Float32Array, bars = 160): number[] {
  const block = Math.floor(signal.length / bars);
  const out: number[] = [];

  for (let i = 0; i < bars; i++) {
    let peak = 0;
    for (let j = 0; j < block; j++) {
      const v = Math.abs(signal[i * block + j] || 0);
      if (v > peak) peak = v;
    }
    out.push(peak);
  }

  return out;
}

export default function RealtimePage() {
  const [isRecording, setIsRecording] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserOriginalRef = useRef<AnalyserNode | null>(null);
  const analyserProcessedRef = useRef<AnalyserNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const outputQueueRef = useRef<Float32Array[]>([]);
  const MIN_QUEUE = 4;
  const MAX_QUEUE = 12;

  const [analysers, setAnalysers] = useState<{
    original: AnalyserNode;
    processed: AnalyserNode;
  } | null>(null);

  const [eq, setEq] = useState<EQ>({
    bass: 0,
    low_mid: 0,
    mid: 0,
    high_mid: 0,
    treble: 0,
    gain: 0,
  });

  const updateBand = (id: keyof EQ, value: number) =>
    setEq((prev) => ({ ...prev, [id]: value }));

  const [waveform, setWaveform] = useState({
    original: [] as number[],
    processed: [] as number[],
  });

  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const ctx = new AudioContext({ latencyHint: "interactive" });
    const source = ctx.createMediaStreamSource(stream);
    const analyserOriginal = ctx.createAnalyser();
    analyserOriginal.fftSize = 2048;
    const analyserProcessed = ctx.createAnalyser();
    analyserProcessed.fftSize = 2048;
    const processor = ctx.createScriptProcessor(512, 1, 1);
    source.connect(analyserOriginal);
    source.connect(processor);
    processor.connect(analyserProcessed);
    analyserProcessed.connect(ctx.destination);
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/realtime-eq");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "gains", gains: eq }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "audio") {
        if (outputQueueRef.current.length < MAX_QUEUE) {
          outputQueueRef.current.push(new Float32Array(msg.audio));
        }
      }
    };

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "audio",
            audio: Array.from(input),
          }),
        );
      }

      if (outputQueueRef.current.length >= MIN_QUEUE) {
        const chunk = outputQueueRef.current.shift();
        if (chunk) {
          const BOOST = 1;
          for (let i = 0; i < chunk.length; i++) {
            output[i] = chunk[i] * BOOST;
          }
        }
      } else if (outputQueueRef.current.length > 0) {
        const chunk = outputQueueRef.current[0];
        const BOOST = 1.8;
        for (let i = 0; i < chunk.length; i++) {
          output[i] = chunk[i] * BOOST;
        }
      } else {
        output.fill(0);
      }
    };

    audioCtxRef.current = ctx;
    processorRef.current = processor;
    analyserOriginalRef.current = analyserOriginal;
    analyserProcessedRef.current = analyserProcessed;
    wsRef.current = ws;

    setAnalysers({
      original: analyserOriginal,
      processed: analyserProcessed,
    });

    setIsRecording(true);
  };

  const stopMic = () => {
    wsRef.current?.close();
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();

    outputQueueRef.current = [];

    wsRef.current = null;
    processorRef.current = null;
    audioCtxRef.current = null;
    analyserOriginalRef.current = null;
    analyserProcessedRef.current = null;

    setAnalysers(null);
    setIsRecording(false);
  };

  useEffect(() => {
    if (!wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: "gains",
        gains: eq,
      }),
    );
  }, [eq]);

  useEffect(() => {
    if (!isRecording) return;
    if (!analyserOriginalRef.current || !analyserProcessedRef.current) return;

    const ao = analyserOriginalRef.current;
    const ap = analyserProcessedRef.current;

    const bufO = new Float32Array(ao.fftSize);
    const bufP = new Float32Array(ap.fftSize);

    let raf = 0;

    const tick = () => {
      ao.getFloatTimeDomainData(bufO);
      ap.getFloatTimeDomainData(bufP);

      setWaveform({
        original: computeWaveform(bufO),
        processed: computeWaveform(bufP),
      });

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [isRecording]);

  return (
    <div className="space-y-10 p-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="mb-4 text-center text-xl font-bold text-lime-400">
          REALTIME MIXER
        </h2>

        <button
          onClick={isRecording ? stopMic : startMic}
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full
            ${isRecording ? "bg-red-500" : "bg-lime-400"}`}
        >
          <Mic className="h-10 w-10" color="#172554" />
        </button>
      </div>

      <EqSliders values={eq} onChange={updateBand} />

      <WaveformCompare
        original={waveform.original}
        processed={waveform.processed}
        showAlert={!isRecording}
      >
        <ExportAlert
          status="idle"
          title="Microphone inactive"
          description="Press the mic button to start realtime mixing"
        />
      </WaveformCompare>

      {isRecording && analysers && (
        <RealtimeSpectrumCompare
          original={analysers.original}
          processed={analysers.processed}
        />
      )}
    </div>
  );
}
