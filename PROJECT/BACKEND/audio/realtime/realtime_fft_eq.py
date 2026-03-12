import numpy as np


class RealtimeFFTEQ:
    def __init__(self, sr: int, frame_size: int = 1024, hop_size: int = 512):
        self.sr = sr
        self.N = frame_size
        self.H = hop_size

        self.window = np.hanning(self.N)
        self.win_norm = np.sum(self.window**2) / self.H

        self.input_buffer = np.zeros(self.N, dtype=np.float32)
        self.overlap = np.zeros(self.N - self.H, dtype=np.float32)

        self.freqs = np.fft.rfftfreq(self.N, 1 / sr)

        self.bands = {
            "bass": (20, 180),
            "low_mid": (180, 450),
            "mid": (450, 2200),
            "high_mid": (2200, 5000),
            "treble": (5000, 20000),
        }

        self.gains_db = {k: 0.0 for k in self.bands}
        self.MAX_DB = 12.0

    def set_gains(self, gains: dict):
        for k in self.gains_db:
            if k in gains:
                v = float(gains[k])
                self.gains_db[k] = max(-self.MAX_DB, min(self.MAX_DB, v))

    def process(self, input_hop: np.ndarray) -> np.ndarray:
        self.input_buffer[: -self.H] = self.input_buffer[self.H :]
        self.input_buffer[-self.H :] = input_hop

        x = self.input_buffer * self.window
        X = np.fft.rfft(x)

        for band, (lo, hi) in self.bands.items():
            g_db = self.gains_db[band]
            if abs(g_db) < 1e-6:
                continue
            g = 10 ** (g_db / 20)
            idx = (self.freqs >= lo) & (self.freqs < hi)
            X[idx] *= g

        y = np.fft.irfft(X)

        out = (y[: self.H] + self.overlap) / self.win_norm
        self.overlap = y[self.H :]

        return np.clip(out, -1.0, 1.0).astype(np.float32)
