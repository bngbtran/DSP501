"""
Tests for FastAPI endpoints (main.py + api/ routers)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
import numpy as np
import io
import soundfile as sf

from main import app
from api.api import OUTPUT_DIR


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def wav_bytes():
    """Generate a small in-memory WAV file"""
    sr = 22050
    duration = 0.5
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    signal = np.sin(2 * np.pi * 440 * t).astype(np.float32)
    buf = io.BytesIO()
    sf.write(buf, signal, sr, format="WAV")
    buf.seek(0)
    return buf.read()


class TestDownloadEndpoint:
    def test_download_missing_file(self, client):
        response = client.get("/download/nonexistent.wav")
        data = response.json()
        assert "error" in data

    def test_download_returns_file(self, client, tmp_path):
        """If file exists in output dir, it should be returned"""
        import os

        os.makedirs(OUTPUT_DIR, exist_ok=True)
        test_file = os.path.join(OUTPUT_DIR, "test_download.wav")

        sr = 22050
        signal = np.zeros(sr, dtype=np.float32)
        sf.write(test_file, signal, sr)

        try:
            response = client.get("/download/test_download.wav")
            assert response.status_code == 200
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)


class TestEqualizerEndpoint:
    def test_equalizer_with_wav(self, client, wav_bytes):
        """Test equalizer endpoint with a valid WAV file (no ffmpeg needed)"""
        response = client.post(
            "/equalizer",
            files={"file": ("test.wav", wav_bytes, "audio/wav")},
            data={
                "bass": "3",
                "low_mid": "0",
                "mid": "0",
                "high_mid": "0",
                "treble": "0",
                "gain": "0",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "download_url" in data
        assert "waveform" in data
        assert "original" in data["waveform"]
        assert "processed" in data["waveform"]
