import sounddevice as sd
import numpy as np

from audio.realtime.realtime_fft_eq import RealtimeFFTEQ

SR = 44100
FRAME = 1024
HOP = 512

eq = RealtimeFFTEQ(SR, FRAME, HOP)
eq.set_gains(
    {"bass": -12, "low_mid": 12, "mid": -12, "high_mid": 12, "treble": -12, "gain": 12}
)


def audio_callback(indata, outdata, frames, time, status):
    mono = indata[:, 0]
    y = eq.process(mono)
    outdata[:, 0] = y


with sd.Stream(
    samplerate=SR,
    blocksize=HOP,
    channels=2,
    dtype="float32",
    callback=audio_callback,
):
    print("🎤 Realtime FFT Equalizer running...")
    input("Press ENTER to stop\n")
