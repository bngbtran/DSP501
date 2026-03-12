"""
features.py

Extract audio features for music genre classification and audio analysis
"""

import numpy as np
import librosa


def extract_mfcc(signal, sr, n_mfcc=13):
    """
    Extract MFCC features from audio signal

    Parameters
    ----------
    signal : np.ndarray
        Audio signal
    sr : int
        Sample rate
    n_mfcc : int
        Number of MFCC coefficients

    Returns
    -------
    features : np.ndarray
        Mean MFCC feature vector
    """
    mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=n_mfcc)
    mfcc_mean = np.mean(mfcc, axis=1)
    return mfcc_mean


def extract_full_features(signal, sr):
    """
    Extract comprehensive audio features for analysis.

    Returns a dict with:
    - metadata: duration, sample_rate, num_samples
    - mfcc: 13 MFCC coefficients (mean)
    - spectral: centroid, bandwidth, rolloff, contrast, flatness
    - rhythm: tempo, beat_count
    - energy: rms_mean, rms_max, zero_crossing_rate
    - chroma: 12 chroma features (mean)
    """
    duration = float(len(signal) / sr)
    mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfcc, axis=1).tolist()
    spectral_centroid = float(
        np.mean(librosa.feature.spectral_centroid(y=signal, sr=sr))
    )
    spectral_bandwidth = float(
        np.mean(librosa.feature.spectral_bandwidth(y=signal, sr=sr))
    )
    spectral_rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=signal, sr=sr)))
    spectral_contrast = np.mean(
        librosa.feature.spectral_contrast(y=signal, sr=sr), axis=1
    ).tolist()
    spectral_flatness = float(np.mean(librosa.feature.spectral_flatness(y=signal)))
    tempo, beats = librosa.beat.beat_track(y=signal, sr=sr)
    tempo_val = float(tempo) if np.isscalar(tempo) else float(tempo[0])
    rms = librosa.feature.rms(y=signal)[0]
    rms_mean = float(np.mean(rms))
    rms_max = float(np.max(rms))
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y=signal)))
    chroma = librosa.feature.chroma_stft(y=signal, sr=sr)
    chroma_mean = np.mean(chroma, axis=1).tolist()

    return {
        "metadata": {
            "duration_seconds": round(duration, 2),
            "sample_rate": sr,
            "num_samples": len(signal),
        },
        "mfcc": {
            "coefficients": mfcc_mean,
            "labels": [f"MFCC {i + 1}" for i in range(13)],
        },
        "spectral": {
            "centroid": round(spectral_centroid, 2),
            "bandwidth": round(spectral_bandwidth, 2),
            "rolloff": round(spectral_rolloff, 2),
            "contrast": [round(c, 4) for c in spectral_contrast],
            "flatness": round(spectral_flatness, 6),
        },
        "rhythm": {
            "tempo_bpm": round(tempo_val, 2),
            "beat_count": int(len(beats)),
        },
        "energy": {
            "rms_mean": round(rms_mean, 6),
            "rms_max": round(rms_max, 6),
            "zero_crossing_rate": round(zcr, 6),
        },
        "chroma": {
            "values": chroma_mean,
            "labels": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
        },
    }
