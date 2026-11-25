/**
 * Measured pitch error (cents) of each recorded note in public/audio/guitar/<midi>.mp3.
 * The soundfont's samples are not all exactly in tune (low notes up to −15 cents); playback
 * applies `detune = −error` so every note sounds at equal temperament.
 *
 * Measured with pitchy (McLeod) on 8192-sample windows at 120–800 ms, median of clear frames.
 * Verified by tests/e2e/samples.spec.ts. 83 (B5) has no clear reading and is left uncorrected.
 */
export const SAMPLE_CENTS_ERROR: Record<number, number> = {
  40: -9.2,
  41: -14.6,
  42: -14.4,
  43: -6.8,
  44: -6.8,
  45: -15.3,
  46: -15.2,
  47: -5.1,
  48: -4.6,
  49: -4.7,
  50: -7.6,
  51: -7.6,
  52: -10.9,
  53: -9.6,
  54: -9.7,
  55: -1.2,
  56: -1.3,
  57: 1.6,
  58: 1.6,
  59: -5.2,
  60: 1.1,
  61: 0.8,
  62: -1.2,
  63: -1.2,
  64: -3,
  65: 0,
  66: -0.1,
  67: -3.3,
  68: -3.4,
  69: 6.1,
  70: 6,
  71: -2.6,
  72: -3,
  73: -3.3,
  74: -2.7,
  75: -2.7,
  76: 5.4,
  77: 6.1,
  78: 6.3,
  79: 6.9,
  80: 6.8,
  81: 4,
  82: 3.1,
  83: 0,
  84: -1.9,
  85: -2,
};

export const SAMPLE_MIDI_RANGE = { low: 40, high: 85 } as const;
