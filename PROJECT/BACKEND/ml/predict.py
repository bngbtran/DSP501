"""
predict.py

Predict music genre from audio file using trained model
"""

import joblib
import librosa
import numpy as np
from functools import lru_cache

from ml.features import extract_mfcc

MODEL_PATH = "models/genre_model.pkl"
SAMPLE_RATE = 22050
N_MFCC = 13


@lru_cache(maxsize=1)
def _load_model():
    bundle = joblib.load(MODEL_PATH)
    return bundle["model"], bundle["label_encoder"]


def predict_genre(file):
    """
    Predict genre from uploaded audio file
    """
    model, label_encoder = _load_model()

    signal, sr = librosa.load(file, sr=SAMPLE_RATE, mono=True)

    features = extract_mfcc(signal, sr, n_mfcc=N_MFCC)
    features = features.reshape(1, -1)

    probs = model.predict_proba(features)[0]
    idx = int(np.argmax(probs))

    genre = label_encoder.inverse_transform([idx])[0]
    confidence = float(probs[idx])

    return genre, confidence
