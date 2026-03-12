"""
Tests for audio/equalizer.py
"""

import numpy as np
import pytest
from audio.equalizer import apply_equalizer


class TestApplyEqualizer:
    def test_zero_gains_passthrough(self, sample_signal):
        """With all gains at 0 dB, output ≈ input"""
        signal, sr = sample_signal
        gains = {
            "bass": 0,
            "low_mid": 0,
            "mid": 0,
            "high_mid": 0,
            "treble": 0,
        }
        output = apply_equalizer(signal, sr, gains)
        np.testing.assert_array_almost_equal(output, signal, decimal=4)

    def test_preserves_length(self, sample_signal):
        signal, sr = sample_signal
        gains = {"bass": 3, "low_mid": 0, "mid": -2, "high_mid": 1, "treble": -1}
        output = apply_equalizer(signal, sr, gains)
        assert len(output) == len(signal)

    def test_boost_bass_increases_low_freq_energy(self):
        """Boosting bass should increase energy in low frequencies"""
        sr = 22050
        duration = 1.0
        t = np.linspace(0, duration, int(sr * duration), endpoint=False)
        signal = (np.sin(2 * np.pi * 100 * t) + np.sin(2 * np.pi * 5000 * t)).astype(
            np.float32
        )

        gains = {"bass": 12, "low_mid": 0, "mid": 0, "high_mid": 0, "treble": 0}
        output = apply_equalizer(signal, sr, gains)
        spectrum_in = np.abs(np.fft.rfft(signal))
        spectrum_out = np.abs(np.fft.rfft(output))
        freqs = np.fft.rfftfreq(len(signal), d=1.0 / sr)

        bass_mask = (freqs >= 20) & (freqs < 180)
        assert np.sum(spectrum_out[bass_mask]) > np.sum(spectrum_in[bass_mask])

    def test_missing_bands_default_to_zero(self, sample_signal):
        """Bands not specified in gains dict should default to 0 dB"""
        signal, sr = sample_signal
        gains = {"bass": 0}
        output = apply_equalizer(signal, sr, gains)
        np.testing.assert_array_almost_equal(output, signal, decimal=4)

    def test_returns_real_signal(self, sample_signal):
        signal, sr = sample_signal
        gains = {"bass": 6, "treble": -3}
        output = apply_equalizer(signal, sr, gains)
        assert np.isrealobj(output)

    def test_silent_signal(self, silent_signal):
        signal, sr = silent_signal
        gains = {"bass": 6, "low_mid": 3, "mid": 0, "high_mid": -3, "treble": -6}
        output = apply_equalizer(signal, sr, gains)
        np.testing.assert_array_almost_equal(output, np.zeros_like(signal), decimal=5)
