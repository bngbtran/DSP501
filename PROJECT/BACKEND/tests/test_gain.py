"""
Tests for audio/gain.py
"""

import numpy as np
import pytest
from audio.gain import apply_gain


class TestApplyGain:
    def test_zero_gain(self, sample_signal):
        signal, sr = sample_signal
        output = apply_gain(signal, 0.0)
        np.testing.assert_array_almost_equal(output, signal, decimal=5)

    def test_positive_gain(self, sample_signal):
        signal, sr = sample_signal
        output = apply_gain(signal, 6.0)
        assert np.sqrt(np.mean(output**2)) > np.sqrt(np.mean(signal**2))

    def test_negative_gain(self, sample_signal):
        signal, sr = sample_signal
        output = apply_gain(signal, -6.0)
        assert np.sqrt(np.mean(output**2)) < np.sqrt(np.mean(signal**2))

    def test_output_clipped(self):
        """Output should be clipped to [-1.0, 1.0]"""
        signal = np.ones(100, dtype=np.float32)
        output = apply_gain(signal, 12.0)
        assert np.max(output) <= 1.0
        assert np.min(output) >= -1.0

    def test_gain_clamped_to_12db(self):
        """Gain should be clamped to ±12 dB"""
        signal = np.full(100, 0.1, dtype=np.float32)
        out_12 = apply_gain(signal, 12.0)
        out_20 = apply_gain(signal, 20.0)
        np.testing.assert_array_almost_equal(out_12, out_20, decimal=5)

    def test_preserves_length(self, sample_signal):
        signal, sr = sample_signal
        output = apply_gain(signal, 3.0)
        assert len(output) == len(signal)

    def test_silent_signal(self, silent_signal):
        signal, sr = silent_signal
        output = apply_gain(signal, 6.0)
        np.testing.assert_array_almost_equal(output, signal, decimal=5)
