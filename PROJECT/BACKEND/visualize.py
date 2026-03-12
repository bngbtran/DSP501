"""
visualize.py

Visualization utilities for audio signal:
- Time-domain waveform
- Frequency-domain FFT spectrum
"""

import numpy as np
import matplotlib.pyplot as plt


def plot_waveform(signal, sr, title="Waveform"):
    """
    Plot time-domain waveform.

    Parameters
    ----------
    signal : np.ndarray
        Audio signal
    sr : int
        Sample rate
    title : str
        Plot title
    """
    time = np.linspace(0, len(signal) / sr, num=len(signal))

    plt.figure(figsize=(10, 4))
    plt.plot(time, signal)
    plt.title(title)
    plt.xlabel("Time (s)")
    plt.ylabel("Amplitude")
    plt.tight_layout()
    plt.show()


def plot_spectrum(signal, sr, title="FFT Spectrum"):
    """
    Plot frequency-domain magnitude spectrum using FFT.

    Parameters
    ----------
    signal : np.ndarray
        Audio signal
    sr : int
        Sample rate
    title : str
        Plot title
    """
    spectrum = np.abs(np.fft.rfft(signal))
    freqs = np.fft.rfftfreq(len(signal), d=1.0 / sr)

    plt.figure(figsize=(10, 4))
    plt.plot(freqs, spectrum)
    plt.title(title)
    plt.xlabel("Frequency (Hz)")
    plt.ylabel("Magnitude")
    plt.xlim(0, sr / 2)
    plt.tight_layout()
    plt.show()
