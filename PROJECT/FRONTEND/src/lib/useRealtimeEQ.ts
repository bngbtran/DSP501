import { useEffect, useRef } from "react"
import type { EQ } from "@/lib/eq"

type EQFilters = {
  bass: BiquadFilterNode
  low_mid: BiquadFilterNode
  mid: BiquadFilterNode
  high_mid: BiquadFilterNode
  treble: BiquadFilterNode
}

export function useRealtimeEQ(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  eq: EQ
) {
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const filtersRef = useRef<EQFilters | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    const ctx = ctxRef.current

    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audio)
    }
    const source = sourceRef.current

    if (!filtersRef.current) {
      const bass = ctx.createBiquadFilter()
      bass.type = "lowshelf"
      bass.frequency.value = 100

      const low_mid = ctx.createBiquadFilter()
      low_mid.type = "peaking"
      low_mid.frequency.value = 300
      low_mid.Q.value = 0.7

      const mid = ctx.createBiquadFilter()
      mid.type = "peaking"
      mid.frequency.value = 1000
      mid.Q.value = 0.7

      const high_mid = ctx.createBiquadFilter()
      high_mid.type = "peaking"
      high_mid.frequency.value = 3500
      high_mid.Q.value = 0.7

      const treble = ctx.createBiquadFilter()
      treble.type = "highshelf"
      treble.frequency.value = 7000

      filtersRef.current = {
        bass,
        low_mid,
        mid,
        high_mid,
        treble,
      }

      const masterGain = ctx.createGain()
      masterGainRef.current = masterGain

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      source
        .connect(bass)
      bass
        .connect(low_mid)
      low_mid
        .connect(mid)
      mid
        .connect(high_mid)
      high_mid
        .connect(treble)
      treble
        .connect(masterGain)
      masterGain
        .connect(analyser)
      analyser
        .connect(ctx.destination)
    }

    const resume = () => {
      if (ctx.state === "suspended") ctx.resume()
    }
    audio.addEventListener("play", resume)

    return () => {
      audio.removeEventListener("play", resume)
    }
  }, [audioRef])

  useEffect(() => {
    const f = filtersRef.current
    const ctx = ctxRef.current
    if (!f || !ctx) return

    const safe = (v: number) => (Number.isFinite(v) ? v : 0)

    f.bass.gain.setValueAtTime(safe(eq.bass), ctx.currentTime)
    f.low_mid.gain.setValueAtTime(safe(eq.low_mid), ctx.currentTime)
    f.mid.gain.setValueAtTime(safe(eq.mid), ctx.currentTime)
    f.high_mid.gain.setValueAtTime(safe(eq.high_mid), ctx.currentTime)
    f.treble.gain.setValueAtTime(safe(eq.treble), ctx.currentTime)

    const linear = Math.pow(10, safe(eq.gain) / 20)
    masterGainRef.current?.gain.setValueAtTime(linear, ctx.currentTime)
  }, [eq])

  return {
    analyserRef,
  }
}
