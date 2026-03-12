"""
Tests for audio/waveform.py
"""

import numpy as np
import pytest
from audio.waveform import compute_waveform


class TestComputeWaveform:
    def test_returns_list(self, sample_signal):
        signal, sr = sample_signal
        result = compute_waveform(signal)
        assert isinstance(result, list)

    def test_default_bars(self, sample_signal):
        signal, sr = sample_signal
        result = compute_waveform(signal)
        assert len(result) == 170

    def test_custom_bars(self, sample_signal):
        signal, sr = sample_signal
        result = compute_waveform(signal, bars=50)
        assert len(result) == 50

    def test_values_between_0_and_1(self, sample_signal):
        signal, sr = sample_signal
        result = compute_waveform(signal)
        for val in result:
            assert 0.0 <= val <= 1.0

    def test_silent_signal_all_zeros(self, silent_signal):
        signal, sr = silent_signal
        result = compute_waveform(signal)
        assert all(v == 0.0 for v in result)

    def test_values_are_floats(self, sample_signal):
        signal, sr = sample_signal
        result = compute_waveform(signal)
        for val in result:
            assert isinstance(val, float)
