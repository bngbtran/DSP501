"""
pre_post_processing.py

Xử lý audio trước và sau bộ lọc FFT Equalizer
- Pre-processing: Chuẩn bị tín hiệu đầu vào
- Post-processing: Xử lý tín hiệu đầu ra sau EQ
- Analysis: So sánh và phân tích tín hiệu trước/sau EQ
"""

import numpy as np
import librosa
from scipy import signal
from audio.audio_io import load_audio, save_audio
from audio.equalizer import apply_equalizer
from audio.filters import db_to_gain, get_frequency_bands
from visualize import plot_waveform, plot_spectrum


def pre_process_audio(file_path, sr=None, normalize=True, trim_silence=True):
    """
    Xử lý audio trước khi vào bộ lọc EQ

    Parameters
    ----------
    file_path : str
        Đường dẫn file audio
    sr : int or None
        Sample rate đích (None = giữ nguyên)
    normalize : bool
        Chuẩn hóa biên độ tín hiệu
    trim_silence : bool
        Cắt khoảng lặng ở đầu/cuối

    Returns
    -------
    signal : np.ndarray
        Tín hiệu đã pre-process
    sr : int
        Sample rate
    """
    print(f"📂 Loading audio from: {file_path}")

    signal, sr = load_audio(file_path, sr=sr)

    print(f"   - Original length: {len(signal)} samples")
    print(f"   - Sample rate: {sr} Hz")
    print(f"   - Duration: {len(signal) / sr:.2f} seconds")

    if trim_silence:
        signal, _ = librosa.effects.trim(signal, top_db=20)
        print(f"   - After trim silence: {len(signal)} samples")

    if normalize:
        max_val = np.max(np.abs(signal))
        if max_val > 0:
            signal = signal / max_val
            print(f"   - Normalized (max amplitude: {max_val:.3f})")

    rms = np.sqrt(np.mean(signal**2))
    peak = np.max(np.abs(signal))
    print(f"   - RMS level: {20 * np.log10(rms):.2f} dB")
    print(f"   - Peak level: {20 * np.log10(peak):.2f} dB")

    return signal, sr


def post_process_audio(signal, sr, normalize=True, limiter_threshold=0.95):
    """
    Xử lý audio sau khi qua bộ lọc EQ

    Parameters
    ----------
    signal : np.ndarray
        Tín hiệu sau EQ
    sr : int
        Sample rate
    normalize : bool
        Chuẩn hóa biên độ
    limiter_threshold : float
        Ngưỡng limiter (0.0-1.0)

    Returns
    -------
    processed_signal : np.ndarray
        Tín hiệu đã post-process
    """
    print("\n🔧 Post-processing audio...")

    processed_signal = signal.copy()

    if limiter_threshold < 1.0:
        peak = np.max(np.abs(processed_signal))
        if peak > limiter_threshold:
            ratio = limiter_threshold / peak
            processed_signal = processed_signal * ratio
            print(f"   - Applied limiter (ratio: {ratio:.3f})")

    if normalize:
        max_val = np.max(np.abs(processed_signal))
        if max_val > 0:
            processed_signal = processed_signal / max_val
            print(f"   - Normalized output")

    rms = np.sqrt(np.mean(processed_signal**2))
    peak = np.max(np.abs(processed_signal))
    print(f"   - Final RMS level: {20 * np.log10(rms):.2f} dB")
    print(f"   - Final Peak level: {20 * np.log10(peak):.2f} dB")

    return processed_signal


def analyze_frequency_response(original_signal, processed_signal, sr):
    """
    Phân tích đáp ứng tần số trước và sau EQ

    Parameters
    ----------
    original_signal : np.ndarray
        Tín hiệu gốc
    processed_signal : np.ndarray
        Tín hiệu sau EQ
    sr : int
        Sample rate

    Returns
    -------
    analysis : dict
        Kết quả phân tích
    """
    print("\n📊 Analyzing frequency response...")

    N = min(len(original_signal), len(processed_signal))

    orig_spectrum = np.abs(np.fft.rfft(original_signal[:N]))
    orig_freqs = np.fft.rfftfreq(N, d=1.0 / sr)
    proc_spectrum = np.abs(np.fft.rfft(processed_signal[:N]))
    proc_freqs = np.fft.rfftfreq(N, d=1.0 / sr)

    bands = get_frequency_bands()
    band_gains = {}

    for band_name, (low, high) in bands.items():
        idx = (orig_freqs >= low) & (orig_freqs < high)

        if np.any(idx):
            orig_power = np.mean(orig_spectrum[idx] ** 2)
            proc_power = np.mean(proc_spectrum[idx] ** 2)

            if orig_power > 0:
                gain_db = 10 * np.log10(proc_power / orig_power)
            else:
                gain_db = 0.0

            band_gains[band_name] = gain_db
            print(f"   - {band_name}: {gain_db:+.2f} dB")

    orig_total_power = np.mean(orig_spectrum**2)
    proc_total_power = np.mean(proc_spectrum**2)

    if orig_total_power > 0:
        total_gain_db = 10 * np.log10(proc_total_power / orig_total_power)
    else:
        total_gain_db = 0.0

    print(f"   - Total gain: {total_gain_db:+.2f} dB")

    return {
        "band_gains": band_gains,
        "total_gain_db": total_gain_db,
        "orig_spectrum": orig_spectrum,
        "proc_spectrum": proc_spectrum,
        "freqs": orig_freqs,
    }


def compare_before_after_eq(file_path, gains_db, output_path=None):
    """
    So sánh tín hiệu trước và sau EQ hoàn chỉnh

    Parameters
    ----------
    file_path : str
        Đường dẫn file audio đầu vào
    gains_db : dict
        Gain settings cho EQ
    output_path : str or None
        Đường dẫn lưu file output

    Returns
    -------
    results : dict
        Kết quả xử lý và phân tích
    """
    print("=" * 60)
    print("🎵 AUDIO PROCESSING: BEFORE vs AFTER EQUALIZER")
    print("=" * 60)
    original_signal, sr = pre_process_audio(file_path)
    print(f"\n🎚️ Applying EQ with gains: {gains_db}")
    eq_signal = apply_equalizer(original_signal, sr, gains_db)
    processed_signal = post_process_audio(eq_signal, sr)
    analysis = analyze_frequency_response(original_signal, processed_signal, sr)

    if output_path:
        save_audio(output_path, processed_signal, sr)
        print(f"\n💾 Saved processed audio to: {output_path}")
        print("\n📈 Generating visualizations...")
    plot_waveform(original_signal, sr, "Original Signal (Pre-EQ)")
    plot_waveform(processed_signal, sr, "Processed Signal (Post-EQ)")
    plot_spectrum(original_signal, sr, "Original Spectrum")
    plot_spectrum(processed_signal, sr, "Processed Spectrum")

    print("\n✅ Processing complete!")

    return {
        "original_signal": original_signal,
        "processed_signal": processed_signal,
        "sample_rate": sr,
        "analysis": analysis,
        "gains_applied": gains_db,
    }


def batch_process_audio(file_paths, gains_db, output_dir="outputs"):
    """
    Xử lý hàng loạt file audio

    Parameters
    ----------
    file_paths : list
        Danh sách đường dẫn file audio
    gains_db : dict
        Gain settings cho EQ
    output_dir : str
        Thư mục lưu kết quả
    """
    import os

    os.makedirs(output_dir, exist_ok=True)

    results = []

    for i, file_path in enumerate(file_paths, 1):
        print(f"\n{'=' * 20} Processing file {i}/{len(file_paths)} {'=' * 20}")

        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(output_dir, f"processed_{base_name}.wav")
        result = compare_before_after_eq(file_path, gains_db, output_path)
        results.append(result)

    print(f"\n🎉 Batch processing complete! Processed {len(file_paths)} files.")
    return results


if __name__ == "__main__":
    INPUT_FILE = "uploads/audio_sample.mp3"
    OUTPUT_FILE = "outputs/demo_processed.wav"

    DEMO_GAINS = {
        "bass": 6,
        "low_mid": -2,
        "mid": 0,
        "high_mid": 3,
        "treble": -3,
    }

    result = compare_before_after_eq(INPUT_FILE, DEMO_GAINS, OUTPUT_FILE)
