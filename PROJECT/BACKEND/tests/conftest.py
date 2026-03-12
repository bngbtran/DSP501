"""
Shared fixtures for all tests
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pytest


@pytest.fixture
def sample_signal():
    """Generate a 1-second sine wave at 440 Hz, sr=22050"""
    sr = 22050
    duration = 1.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    signal = np.sin(2 * np.pi * 440 * t).astype(np.float32)
    return signal, sr


@pytest.fixture
def short_signal():
    """Generate a short 0.1-second sine wave at 1000 Hz, sr=44100"""
    sr = 44100
    duration = 0.1
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    signal = np.sin(2 * np.pi * 1000 * t).astype(np.float32)
    return signal, sr


@pytest.fixture
def silent_signal():
    """Generate a 1-second silent signal"""
    sr = 22050
    signal = np.zeros(sr, dtype=np.float32)
    return signal, sr
