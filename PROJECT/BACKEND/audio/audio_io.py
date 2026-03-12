import librosa
import soundfile as sf


def load_audio(file_path, sr=None):
    """
    Load audio file (.wav, .mp3)

    Parameters
    ----------
    file_path : str
        Path to audio file
    sr : int or None
        Target sample rate (None = keep original)

    Returns
    -------
    signal : np.ndarray
        Mono audio signal
    sr : int
        Sample rate
    """
    signal, sr = librosa.load(file_path, sr=sr, mono=True)
    return signal, sr


def save_audio(file_path, signal, sr):
    """
    Save audio signal to .wav file

    Parameters
    ----------
    file_path : str
        Output file path
    signal : np.ndarray
        Audio signal
    sr : int
        Sample rate
    """
    sf.write(file_path, signal, sr)
