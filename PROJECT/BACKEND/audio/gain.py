import numpy as np
from audio.filters import db_to_gain, clamp


def apply_gain(signal, gain_db: float):
    gain_db = clamp(gain_db, -12.0, 12.0)
    gain = db_to_gain(gain_db)

    output = signal * gain

    output = np.clip(output, -1.0, 1.0)

    return output
