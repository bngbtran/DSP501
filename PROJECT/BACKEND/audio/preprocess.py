import numpy as np
import librosa


def preprocess(signal: np.ndarray):
    signal = signal - np.mean(signal)

    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak

    return signal
