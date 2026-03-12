from audio.preprocess import preprocess
from audio.fft_eq import apply_fft_eq
from audio.postprocess import postprocess


def equalizer_pipeline(signal, sr, gains_db):
    signal = preprocess(signal)
    processed = apply_fft_eq(signal, sr, gains_db)
    processed = postprocess(processed)
    return processed
