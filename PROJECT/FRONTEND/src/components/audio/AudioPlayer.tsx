import { useEffect, useRef, useState } from "react";
import PlayButton from "@/components/common/PlayButton";
import { Trash2, Download } from "lucide-react";
import { useRealtimeEQ } from "@/lib/useRealtimeEQ";
import type { EQ } from "@/lib/eq";

type Props = {
  url: string;
  title: string;
  eq: EQ;
  cover?: string;
  onClear?: () => void;
  onExport?: () => void;
};

const BAR_COUNT = 170;

export default function AudioPlayer({
  url,
  title,
  eq,
  cover = "/assets/logo_green_with_text.png",
  onClear,
  onExport,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useRealtimeEQ(audioRef, eq);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);

  useEffect(() => {
    const ctx = new AudioContext();

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((audioBuffer) => {
        const channel = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channel.length / BAR_COUNT);
        const bars: number[] = [];

        for (let i = 0; i < BAR_COUNT; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channel[i * blockSize + j]);
          }

          bars.push(Math.min(100, Math.max(35, (sum / blockSize) * 220)));
        }

        setWaveform(bars);
      });

    return () => {
      ctx.close();
    };
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }

    setPlaying(!playing);
  };

  const handleSeek = (i: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (i / waveform.length) * duration;
  };

  const formatTime = (sec: number) => {
    if (!sec || Number.isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleClear = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    setPlaying(false);
    setCurrentTime(0);

    onClear?.();
  };

  return (
    <div className="rounded-3xl bg-blue-950/30 p-6">
      <div className="flex items-center gap-6">
        <img src={cover} className="h-28 w-28 rounded-xl object-cover" />

        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlayButton isPlaying={playing} onClick={togglePlay} />
              <p className="text-xl font-bold text-lime-400">{title}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* ACTIONS */}
              <div className="flex items-center">
                <button
                  onClick={handleClear}
                  className="
  rounded-md p-2
  text-white/50 
  hover:text-red-400 
  transition-colors
"
                  title="Clear"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={onExport}
                  className="
    rounded-md p-2
    text-white/50
    hover:text-lime-400
    transition-colors
  "
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex h-20 items-end gap-[3px]"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {waveform.map((h, i) => {
              const playedBars = duration
                ? (currentTime / duration) * waveform.length
                : 0;

              const isPlayed = i <= playedBars;
              const isHovered = hoverIndex !== null && i <= hoverIndex;

              let barColor = "bg-white/40";
              let barScale = "scale-y-60 opacity-50";

              if (isPlayed) {
                barColor = "bg-lime-400";
                barScale = "scale-y-100 opacity-100";
              } else if (isHovered) {
                barColor = "bg-lime-400";
                barScale = "scale-y-60 opacity-40";
              }

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoverIndex(i)}
                  onClick={() => handleSeek(i)}
                  className={`
                    flex-1
                    cursor-pointer
                    rounded-full
                    origin-bottom
                    transition-all duration-150
                    ${barColor}
                    ${barScale}
                  `}
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={url} preload="metadata" />
    </div>
  );
}
