/**
 * コード（和音）の定義
 */
import { type Chord, ChordType } from './types';
import { createNote } from './notes';
import { CIRCLE_OF_FIFTHS_KEYS, CIRCLE_MINOR_KEYS } from './circleOfFifths';

/**
 * コード生成関数
 * @param name コード名
 * @param fullName フルネーム
 * @param noteNames 構成音の音名配列
 * @param rootNote ルート音
 * @param type コードタイプ
 * @param octave 基準オクターブ
 * @returns コードオブジェクト
 */
function createChord(
  name: string,
  fullName: string,
  noteNames: string[],
  rootNote: string,
  type: ChordType,
  octave: number = 4
): Chord {
  const notes = noteNames.map((noteName, index) => {
    // ルート音から順に並べるためのオクターブ調整
    const adjustedOctave = noteName === 'C' && index > 0 ? octave + 1 : octave;
    return createNote(noteName, adjustedOctave);
  });
  
  return {
    name,
    fullName,
    notes,
    rootNote,
    type
  };
}

// C Major スケールのダイアトニックコード
export const C_MAJOR_CHORDS = {
  C: createChord(
    'C',
    'C Major',
    ['C', 'E', 'G'],
    'C',
    ChordType.MAJOR
  ),
  Dm: createChord(
    'Dm',
    'D Minor',
    ['D', 'F', 'A'],
    'D',
    ChordType.MINOR
  ),
  Em: createChord(
    'Em',
    'E Minor',
    ['E', 'G', 'B'],
    'E',
    ChordType.MINOR
  ),
  F: createChord(
    'F',
    'F Major',
    ['F', 'A', 'C'],
    'F',
    ChordType.MAJOR
  ),
  G: createChord(
    'G',
    'G Major',
    ['G', 'B', 'D'],
    'G',
    ChordType.MAJOR
  ),
  Am: createChord(
    'Am',
    'A Minor',
    ['A', 'C', 'E'],
    'A',
    ChordType.MINOR
  ),
  Bdim: createChord(
    'Bdim',
    'B Diminished',
    ['B', 'D', 'F'],
    'B',
    ChordType.DIMINISHED
  ),
  
  // 7thコード
  C7: createChord(
    'C7',
    'C Dominant 7th',
    ['C', 'E', 'G', 'A#'],
    'C',
    ChordType.DOMINANT_7TH
  ),
  Cmaj7: createChord(
    'Cmaj7',
    'C Major 7th',
    ['C', 'E', 'G', 'B'],
    'C',
    ChordType.MAJOR_7TH
  ),
  Dm7: createChord(
    'Dm7',
    'D Minor 7th',
    ['D', 'F', 'A', 'C'],
    'D',
    ChordType.MINOR_7TH
  ),
  G7: createChord(
    'G7',
    'G Dominant 7th',
    ['G', 'B', 'D', 'F'],
    'G',
    ChordType.DOMINANT_7TH
  )
};

// C Major スケールのダイアトニックコード配列
export const C_MAJOR_CHORD_LIST = Object.values(C_MAJOR_CHORDS);

// 五度圏の全てのキーに対応するコード
export const ALL_MAJOR_CHORDS = {
  C: createChord('C', 'C Major', ['C', 'E', 'G'], 'C', ChordType.MAJOR),
  G: createChord('G', 'G Major', ['G', 'B', 'D'], 'G', ChordType.MAJOR),
  D: createChord('D', 'D Major', ['D', 'F#', 'A'], 'D', ChordType.MAJOR),
  A: createChord('A', 'A Major', ['A', 'C#', 'E'], 'A', ChordType.MAJOR),
  E: createChord('E', 'E Major', ['E', 'G#', 'B'], 'E', ChordType.MAJOR),
  B: createChord('B', 'B Major', ['B', 'D#', 'F#'], 'B', ChordType.MAJOR),
  'F#': createChord('F#', 'F# Major', ['F#', 'A#', 'C#'], 'F#', ChordType.MAJOR),
  Db: createChord('Db', 'Db Major', ['Db', 'F', 'Ab'], 'Db', ChordType.MAJOR),
  Ab: createChord('Ab', 'Ab Major', ['Ab', 'C', 'Eb'], 'Ab', ChordType.MAJOR),
  Eb: createChord('Eb', 'Eb Major', ['Eb', 'G', 'Bb'], 'Eb', ChordType.MAJOR),
  Bb: createChord('Bb', 'Bb Major', ['Bb', 'D', 'F'], 'Bb', ChordType.MAJOR),
  F: createChord('F', 'F Major', ['F', 'A', 'C'], 'F', ChordType.MAJOR)
};

export const ALL_MINOR_CHORDS = {
  Am: createChord('Am', 'A Minor', ['A', 'C', 'E'], 'A', ChordType.MINOR),
  Em: createChord('Em', 'E Minor', ['E', 'G', 'B'], 'E', ChordType.MINOR),
  Bm: createChord('Bm', 'B Minor', ['B', 'D', 'F#'], 'B', ChordType.MINOR),
  'F#m': createChord('F#m', 'F# Minor', ['F#', 'A', 'C#'], 'F#', ChordType.MINOR),
  'C#m': createChord('C#m', 'C# Minor', ['C#', 'E', 'G#'], 'C#', ChordType.MINOR),
  'G#m': createChord('G#m', 'G# Minor', ['G#', 'B', 'D#'], 'G#', ChordType.MINOR),
  'D#m': createChord('D#m', 'D# Minor', ['D#', 'F#', 'A#'], 'D#', ChordType.MINOR),
  Bbm: createChord('Bbm', 'Bb Minor', ['Bb', 'Db', 'F'], 'Bb', ChordType.MINOR),
  Fm: createChord('Fm', 'F Minor', ['F', 'Ab', 'C'], 'F', ChordType.MINOR),
  Cm: createChord('Cm', 'C Minor', ['C', 'Eb', 'G'], 'C', ChordType.MINOR),
  Gm: createChord('Gm', 'G Minor', ['G', 'Bb', 'D'], 'G', ChordType.MINOR),
  Dm: createChord('Dm', 'D Minor', ['D', 'F', 'A'], 'D', ChordType.MINOR)
};

// 全てのコードを統合
export const ALL_CHORDS = { ...ALL_MAJOR_CHORDS, ...ALL_MINOR_CHORDS };

/**
 * キー名からコードを取得する関数
 */
export function getChordByName(keyName: string): Chord | undefined {
  return ALL_CHORDS[keyName as keyof typeof ALL_CHORDS];
}

// よく使われるコード進行
export const COMMON_CHORD_PROGRESSIONS = {
  '王道進行': [C_MAJOR_CHORDS.C, C_MAJOR_CHORDS.G, C_MAJOR_CHORDS.Am, C_MAJOR_CHORDS.F],
  '小室進行': [C_MAJOR_CHORDS.Am, C_MAJOR_CHORDS.F, C_MAJOR_CHORDS.G, C_MAJOR_CHORDS.C],
  'カノン進行': [C_MAJOR_CHORDS.C, C_MAJOR_CHORDS.G, C_MAJOR_CHORDS.Am, C_MAJOR_CHORDS.Em, C_MAJOR_CHORDS.F, C_MAJOR_CHORDS.C, C_MAJOR_CHORDS.F, C_MAJOR_CHORDS.G]
};
