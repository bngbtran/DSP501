export type EqualizerParams = {
  file: File | Blob   // ✅ FIX
  bass: number
  low_mid: number
  mid: number
  high_mid: number
  treble: number
  gain: number
}

export type EqualizerResponse = {
  message: string
  download_url: string
  waveform: {
    original: number[]
    processed: number[]
  }
}

export async function applyEqualizer({
  file,
  bass,
  low_mid,
  mid,
  high_mid,
  treble,
  gain
}: EqualizerParams): Promise<EqualizerResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const params = new URLSearchParams({
    bass: String(bass),
    low_mid: String(low_mid),
    mid: String(mid),
    high_mid: String(high_mid),
    treble: String(treble),
    gain: String(gain)
  })

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/equalizer?${params.toString()}`,
    {
      method: "POST",
      body: formData,
    }
  )

  if (!res.ok) {
    throw new Error("Equalizer failed")
  }

  return res.json()
}

