import os
import shutil
import time
import subprocess
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import librosa
from fastapi import WebSocket
import numpy as np

from audio.spectrum import compute_spectrum
from audio.pipeline import equalizer_pipeline
from audio.audio_io import save_audio
from audio.waveform import compute_waveform
from ml.predict import predict_genre
from ml.features import extract_full_features

from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()

INPUT_DIR = "dataset/input"
OUTPUT_DIR = "dataset/output"

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG_PATH = os.path.join(BASE_DIR, "ffmpeg", "ffmpeg.exe")


@router.post("/equalizer")
async def equalizer(
    file: UploadFile = File(...),
    bass: float = 0.0,
    low_mid: float = 0.0,
    mid: float = 0.0,
    high_mid: float = 0.0,
    treble: float = 0.0,
    gain: float = 0.0,
):
    try:
        base_name, ext = os.path.splitext(file.filename or "recording")
        input_path = os.path.join(INPUT_DIR, f"{base_name}{ext}")
        wav_path = os.path.join(INPUT_DIR, f"{base_name}.wav")
        output_path = os.path.join(OUTPUT_DIR, f"mix_{base_name}.wav")

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if ext.lower() in [".webm", ".ogg", ".mp3"]:
            subprocess.run(
                [FFMPEG_PATH, "-y", "-i", input_path, wav_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True,
            )
            audio_path = wav_path
        else:
            audio_path = input_path

        signal, sr = librosa.load(audio_path, sr=None, mono=True)

        gains = {
            "bass": bass,
            "low_mid": low_mid,
            "mid": mid,
            "high_mid": high_mid,
            "treble": treble,
            "gain": gain,
        }

        output = equalizer_pipeline(signal, sr, gains)

        if gain != 0:
            output *= 10 ** (gain / 20)

        save_audio(output_path, output, sr)

        wave_original = compute_waveform(signal)
        wave_processed = compute_waveform(output)
        spectrum_original = compute_spectrum(signal, sr)
        spectrum_processed = compute_spectrum(output, sr)

        return {
            "message": "Track mixed successfully !!!",
            "download_url": f"/download/{os.path.basename(output_path)}",
            "waveform": {
                "original": wave_original,
                "processed": wave_processed,
            },
            "spectrum": {
                "original": spectrum_original,
                "processed": spectrum_processed,
            },
        }

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/download/{filename}")
def download_file(filename: str):
    path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(path):
        return {"error": "File not found !!!"}

    return FileResponse(path, media_type="audio/wav", filename=filename)


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    bass: float = 0.0,
    low_mid: float = 0.0,
    mid: float = 0.0,
    high_mid: float = 0.0,
    treble: float = 0.0,
    gain: float = 0.0,
):
    """
    Phân tích tín hiệu số audio:
    - Biểu diễn dạng sóng (waveform) trước và sau khi cân bằng
    - Phổ tần số (FFT spectrum) trước và sau xử lý
    - Đặc trưng âm thanh (MFCC, spectral features, rhythm, energy, chroma)
    - Phân loại dòng nhạc với mức độ tin cậy (genre classification)

    Cho phép điều chỉnh EQ để quan sát sự thay đổi tín hiệu trong miền thời gian và tần số.
    """
    try:
        base_name, ext = os.path.splitext(file.filename or "audio")

        input_path = os.path.join(INPUT_DIR, f"{base_name}{ext}")
        wav_path = os.path.join(INPUT_DIR, f"{base_name}.wav")

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if ext.lower() in [".webm", ".ogg", ".mp3"]:
            subprocess.run(
                [FFMPEG_PATH, "-y", "-i", input_path, wav_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True,
            )
            audio_path = wav_path
        else:
            audio_path = input_path

        signal, sr = librosa.load(audio_path, sr=None, mono=True)
        waveform_original = compute_waveform(signal)
        spectrum_original = compute_spectrum(signal, sr)

        gains = {
            "bass": bass,
            "low_mid": low_mid,
            "mid": mid,
            "high_mid": high_mid,
            "treble": treble,
            "gain": gain,
        }
        output_signal = equalizer_pipeline(signal, sr, gains)

        if gain != 0:
            output_signal *= 10 ** (gain / 20)

        waveform_processed = compute_waveform(output_signal)
        spectrum_processed = compute_spectrum(output_signal, sr)
        features = extract_full_features(signal, sr)

        try:
            genre, confidence = predict_genre(audio_path)
            classification = {
                "genre": genre,
                "confidence": round(float(confidence), 4),
            }
        except Exception as clf_err:
            print(f"Classification warning: {clf_err}")
            classification = {
                "genre": "unknown",
                "confidence": 0.0,
            }

        return {
            "message": "Audio analyzed successfully! Phân tích tín hiệu số hoàn tất.",
            "filename": file.filename,
            "waveform": {
                "original": waveform_original,
                "processed": waveform_processed,
            },
            "spectrum": {
                "original": spectrum_original,
                "processed": spectrum_processed,
            },
            "features": features,
            "classification": classification,
            "eq_settings": gains,
        }

    except Exception as e:
        print(f"ANALYZE ERROR: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
