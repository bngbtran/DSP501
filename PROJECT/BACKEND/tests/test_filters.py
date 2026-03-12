"""
Tests for audio/filters.py
"""

import pytest
from audio.filters import db_to_gain, clamp, get_frequency_bands


class TestDbToGain:
    def test_zero_db(self):
        assert db_to_gain(0) == pytest.approx(1.0)

    def test_positive_db(self):
        # +6 dB ≈ 1.9953
        assert db_to_gain(6) == pytest.approx(10 ** (6 / 20), rel=1e-4)

    def test_negative_db(self):
        # -6 dB ≈ 0.5012
        assert db_to_gain(-6) == pytest.approx(10 ** (-6 / 20), rel=1e-4)

    def test_plus_20db(self):
        assert db_to_gain(20) == pytest.approx(10.0)

    def test_minus_20db(self):
        assert db_to_gain(-20) == pytest.approx(0.1)


class TestClamp:
    def test_value_within_range(self):
        assert clamp(5, 0, 10) == 5

    def test_value_below_min(self):
        assert clamp(-5, 0, 10) == 0

    def test_value_above_max(self):
        assert clamp(15, 0, 10) == 10

    def test_value_at_min(self):
        assert clamp(0, 0, 10) == 0

    def test_value_at_max(self):
        assert clamp(10, 0, 10) == 10

    def test_negative_range(self):
        assert clamp(0, -12, 12) == 0
        assert clamp(-15, -12, 12) == -12
        assert clamp(15, -12, 12) == 12


class TestGetFrequencyBands:
    def test_returns_dict(self):
        bands = get_frequency_bands()
        assert isinstance(bands, dict)

    def test_has_all_bands(self):
        bands = get_frequency_bands()
        expected = {"bass", "low_mid", "mid", "high_mid", "treble"}
        assert set(bands.keys()) == expected

    def test_bands_are_tuples(self):
        bands = get_frequency_bands()
        for band, (low, high) in bands.items():
            assert low < high, f"{band}: low ({low}) should be < high ({high})"

    def test_bands_cover_audible_range(self):
        bands = get_frequency_bands()
        assert bands["bass"][0] == 20
        assert bands["treble"][1] == 20000

    def test_bands_are_contiguous(self):
        """Bands should connect without gaps"""
        bands = get_frequency_bands()
        order = ["bass", "low_mid", "mid", "high_mid", "treble"]
        for i in range(len(order) - 1):
            current_high = bands[order[i]][1]
            next_low = bands[order[i + 1]][0]
            assert current_high == next_low, (
                f"Gap between {order[i]} and {order[i + 1]}: "
                f"{current_high} != {next_low}"
            )
