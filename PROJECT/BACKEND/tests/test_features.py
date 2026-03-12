"""
Tests for ml/features.py
"""

import numpy as np
import pytest
from ml.features import extract_mfcc


class TestExtractMfcc:
    def test_returns_ndarray(self, sample_signal):
        signal, sr = sample_signal
        result = extract_mfcc(signal, sr)
        assert isinstance(result, np.ndarray)

    def test_default_n_mfcc(self, sample_signal):
        signal, sr = sample_signal
        result = extract_mfcc(signal, sr, n_mfcc=13)
        assert result.shape == (13,)

    def test_custom_n_mfcc(self, sample_signal):
        signal, sr = sample_signal
        result = extract_mfcc(signal, sr, n_mfcc=20)
        assert result.shape == (20,)

    def test_different_signals_different_features(self):
        sr = 22050
        t = np.linspace(0, 1.0, sr, endpoint=False)
        sig_low = np.sin(2 * np.pi * 200 * t).astype(np.float32)
        sig_high = np.sin(2 * np.pi * 8000 * t).astype(np.float32)

        feat_low = extract_mfcc(sig_low, sr)
        feat_high = extract_mfcc(sig_high, sr)
        assert not np.allclose(feat_low, feat_high)

    def test_no_nan_values(self, sample_signal):
        signal, sr = sample_signal
        result = extract_mfcc(signal, sr)
        assert not np.any(np.isnan(result))
