import numpy as np


def postprocess(signal: np.ndarray, limiter=0.98):
    peak = np.max(np.abs(signal))
    if peak > limiter:
        signal = signal * (limiter / peak)

    return signal
