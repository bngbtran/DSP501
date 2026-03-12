import numpy as np


def compute_waveform(signal, bars=170):
    """
    signal: mono float32 [-1, 1]
    return: list[float] 0–1
    """
    N = len(signal)
    block = N // bars

    waveform = []

    for i in range(bars):
        chunk = signal[i * block : (i + 1) * block]
        if len(chunk) == 0:
            waveform.append(0)
        else:
            waveform.append(float(np.max(np.abs(chunk))))

    return waveform
