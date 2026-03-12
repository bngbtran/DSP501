import numpy as np


def compute_spectrum(signal, sr, n_fft=4096):
    """
    Trả về:
    - freqs: list tần số
    - magnitude: list biên độ (dB)
    """

    spectrum = np.fft.rfft(signal, n=n_fft)
    magnitude = np.abs(spectrum)
    magnitude_db = 20 * np.log10(magnitude + 1e-10)
    freqs = np.fft.rfftfreq(n_fft, d=1 / sr)

    return {"freqs": freqs.tolist(), "magnitude": magnitude_db.tolist()}
