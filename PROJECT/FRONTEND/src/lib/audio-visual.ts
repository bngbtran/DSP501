function applyHannWindow(signal: Float32Array): Float32Array {
  const N = signal.length
  const out = new Float32Array(N)

  for (let i = 0; i < N; i++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)))
    out[i] = signal[i] * w
  }

  return out
}

function fft(real: Float32Array, imag: Float32Array) {
  const N = real.length
  let j = 0

  for (let i = 0; i < N; i++) {
    if (i < j) {
      ;[real[i], real[j]] = [real[j], real[i]]
        ;[imag[i], imag[j]] = [imag[j], imag[i]]
    }
    let m = N >> 1
    while (j >= m && m >= 2) {
      j -= m
      m >>= 1
    }
    j += m
  }

  for (let size = 2; size <= N; size <<= 1) {
    const half = size >> 1
    const step = (2 * Math.PI) / size

    for (let i = 0; i < N; i += size) {
      for (let k = 0; k < half; k++) {
        const angle = step * k
        const cos = Math.cos(angle)
        const sin = -Math.sin(angle)

        const tre =
          real[i + k + half] * cos -
          imag[i + k + half] * sin
        const tim =
          real[i + k + half] * sin +
          imag[i + k + half] * cos

        real[i + k + half] = real[i + k] - tre
        imag[i + k + half] = imag[i + k] - tim
        real[i + k] += tre
        imag[i + k] += tim
      }
    }
  }
}

export function computeFFT_Averaged(
  signal: Float32Array,
  fftSize = 2048,
  hopSize = 1024
): number[] {
  const half = fftSize / 2
  const avgSpectrum = new Float32Array(half)
  let frameCount = 0

  for (let start = 0; start + fftSize <= signal.length; start += hopSize) {
    const frame = signal.slice(start, start + fftSize)
    const windowed = applyHannWindow(frame)

    const real = new Float32Array(windowed)
    const imag = new Float32Array(fftSize)

    fft(real, imag)

    for (let i = 0; i < half; i++) {
      const mag = Math.sqrt(
        real[i] * real[i] + imag[i] * imag[i]
      )
      avgSpectrum[i] += mag
    }

    frameCount++
  }

  const spectrumDb: number[] = []
  for (let i = 0; i < half; i++) {
    const mag = avgSpectrum[i] / frameCount
    const db = 20 * Math.log10(mag + 1e-6)
    spectrumDb.push(db)
  }

  return spectrumDb
}
