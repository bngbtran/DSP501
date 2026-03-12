// ===== TYPES =====

export type AudioMetadata = {
  duration_seconds: number
  sample_rate: number
  num_samples: number
}

export type MFCCData = {
  coefficients: number[]
  labels: string[]
}

export type SpectralData = {
  centroid: number
  bandwidth: number
  rolloff: number
  contrast: number[]
  flatness: number
}

export type RhythmData = {
  tempo_bpm: number
  beat_count: number
}

export type EnergyData = {
  rms_mean: number
  rms_max: number
  zero_crossing_rate: number
}

export type ChromaData = {
  values: number[]
  labels: string[]
}

export type AudioFeatures = {
  metadata: AudioMetadata
  mfcc: MFCCData
  spectral: SpectralData
  rhythm: RhythmData
  energy: EnergyData
  chroma: ChromaData
}

export type ClassificationResult = {
  genre: string
  confidence: number
}

export type AnalyzeResponse = {
  message: string
  filename: string
  waveform: {
    original: number[]
    processed: number[]
  }
  spectrum: {
    original: {
      freqs: number[]
      magnitude: number[]
    }
    processed: {
      freqs: number[]
      magnitude: number[]
    }
  }
  features: AudioFeatures
  classification: ClassificationResult
  eq_settings: {
    bass: number
    low_mid: number
    mid: number
    high_mid: number
    treble: number
    gain: number
  }
}

// ===== API CALL =====

export async function analyzeAudio(
  file: File | Blob,
  eqSettings: {
    bass?: number
    low_mid?: number
    mid?: number
    high_mid?: number
    treble?: number
    gain?: number
  } = {}
): Promise<AnalyzeResponse> {
  const formData = new FormData()
  formData.append("file", file)
  
  // Append EQ settings as query parameters
  const params = new URLSearchParams()
  if (eqSettings.bass !== undefined) params.append('bass', String(eqSettings.bass))
  if (eqSettings.low_mid !== undefined) params.append('low_mid', String(eqSettings.low_mid))
  if (eqSettings.mid !== undefined) params.append('mid', String(eqSettings.mid))
  if (eqSettings.high_mid !== undefined) params.append('high_mid', String(eqSettings.high_mid))
  if (eqSettings.treble !== undefined) params.append('treble', String(eqSettings.treble))
  if (eqSettings.gain !== undefined) params.append('gain', String(eqSettings.gain))
  
  const queryString = params.toString()
  const url = `${import.meta.env.VITE_API_URL}/analyze${queryString ? '?' + queryString : ''}`

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Audio analysis failed")
  }

  return res.json()
}
