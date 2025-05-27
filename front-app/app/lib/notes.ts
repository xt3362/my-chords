/**
 * 音符（ノート）の定義と周波数計算
 */
import type { Note } from './types';

// 音名の定義（半音12音）- シャープ記号で統一
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// フラット記号とシャープ記号の対応表
const FLAT_TO_SHARP_MAP: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

// 周波数計算のための定数
const A4_FREQUENCY = 440.0; // A4の周波数（Hz）
const A4_INDEX = 9 + 4 * 12; // A4の音のインデックス（C0を0とした時）

/**
 * 音名をシャープ記号に正規化
 * @param name 音名（例: 'C', 'D#', 'Db'）
 * @returns 正規化された音名
 */
function normalizeNoteName(name: string): string {
  return FLAT_TO_SHARP_MAP[name] || name;
}

/**
 * 音名とオクターブから音符オブジェクトを生成
 * @param name 音名（例: 'C', 'D#', 'Db'）
 * @param octave オクターブ
 * @returns 音符オブジェクト
 */
export function createNote(name: string, octave: number): Note {
  const normalizedName = normalizeNoteName(name);
  const noteIndex = NOTE_NAMES.indexOf(normalizedName);
  if (noteIndex === -1) {
    throw new Error(`Invalid note name: ${name} (normalized: ${normalizedName})`);
  }
    // 半音のインデックスを計算
  const semitonesFromA4 = noteIndex + octave * 12 - A4_INDEX;
  
  // 周波数を計算（平均律）: f = 440 * 2^(n/12)
  const frequency = A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12);
  
  return {
    name, // 元の音名を保持（表示用）
    octave,
    frequency: Math.round(frequency * 100) / 100 // 小数点2桁まで
  };
}

/**
 * C Major スケールの音符を生成
 * @param octave 基準オクターブ（C音のオクターブ）
 * @returns C Major スケールの音符配列
 */
export function createCMajorScale(octave: number): Note[] {
  // C Major スケールの音名: C, D, E, F, G, A, B
  return [
    createNote('C', octave),
    createNote('D', octave),
    createNote('E', octave),
    createNote('F', octave),
    createNote('G', octave),
    createNote('A', octave),
    createNote('B', octave),
    createNote('C', octave + 1), // 1オクターブ上のC
  ];
}

// 主要オクターブの音符を事前に生成
export const MIDDLE_C = createNote('C', 4); // ミドルC (C4)
export const NOTES_OCTAVE_4 = NOTE_NAMES.map(name => createNote(name, 4));
export const C_MAJOR_SCALE = createCMajorScale(4);
