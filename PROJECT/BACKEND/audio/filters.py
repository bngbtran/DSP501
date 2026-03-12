def db_to_gain(db: float) -> float:
    return 10 ** (db / 20)


def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def get_frequency_bands():
    return {
        "bass": (20, 180),
        "low_mid": (180, 450),
        "mid": (450, 2200),
        "high_mid": (2200, 5000),
        "treble": (5000, 20000),
    }
