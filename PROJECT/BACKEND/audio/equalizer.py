import numpy as np
from audio.filters import db_to_gain, get_frequency_bands, clamp


def apply_equalizer(signal, sr, gains_db: dict):
    N = len(signal)

    spectrum = np.fft.rfft(signal)
    freqs = np.fft.rfftfreq(N, d=1.0 / sr)

    bands = get_frequency_bands()

    for band, (low, high) in bands.items():
        gain_db = clamp(gains_db.get(band, 0.0), -12.0, 12.0)
        gain = db_to_gain(gain_db)

        idx = (freqs >= low) & (freqs < high)
        spectrum[idx] *= gain

    output = np.fft.irfft(spectrum, n=N)

    return output
