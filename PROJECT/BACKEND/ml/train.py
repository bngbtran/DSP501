"""
train.py

Train music genre classification model using MFCC features.
Dataset structure:
data_train/
├── rock/
├── jazz/
├── blues/
├── classical/
├── reggae/
└── ...
"""

import os
import numpy as np
import joblib
import librosa

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from ml.features import extract_mfcc


DATASET_PATH = r"D:\dsp-backend\dataset\data_train"
MODEL_OUTPUT_PATH = "models/genre_model.pkl"
SAMPLE_RATE = 22050
N_MFCC = 13


def load_dataset(dataset_path):
    X = []
    y = []

    for genre in os.listdir(dataset_path):
        genre_path = os.path.join(dataset_path, genre)

        if not os.path.isdir(genre_path):
            continue

        print(f"Processing genre: {genre}")

        for file in os.listdir(genre_path):
            if not file.lower().endswith((".wav", ".mp3")):
                continue

            file_path = os.path.join(genre_path, file)

            try:
                signal, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
                mfcc = extract_mfcc(signal, sr, n_mfcc=N_MFCC)

                X.append(mfcc)
                y.append(genre)

            except Exception as e:
                print(f"Failed to process {file_path}: {e}")

    return np.array(X), np.array(y)


def main():
    print("Loading dataset...")
    X, y = load_dataset(DATASET_PATH)

    print(f"Total samples: {len(X)}")

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, X_val, y_train, y_val = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    print("Training model...")
    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_val)
    acc = accuracy_score(y_val, y_pred)
    print(f"Validation accuracy: {acc:.4f}")

    os.makedirs("models", exist_ok=True)
    joblib.dump({"model": model, "label_encoder": label_encoder}, MODEL_OUTPUT_PATH)

    print(f"Model saved to {MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
