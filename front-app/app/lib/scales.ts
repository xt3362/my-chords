/**
 * スケール定義と生成ロジック
 */
import { type Scale, type Chord, ScaleType, ChordType, ChordFunction } from './types';
import { createNote } from './notes';
import { NOTE_NAMES } from './notes';

// スケールの音程パターン定義（半音単位）
const SCALE_PATTERNS: Record<ScaleType, number[]> = {
  [ScaleType.MAJOR]: [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
  [ScaleType.NATURAL_MINOR]: [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
  [ScaleType.HARMONIC_MINOR]: [0, 2, 3, 5, 7, 8, 11], // W-H-W-W-H-W+H-H
  [ScaleType.MELODIC_MINOR]: [0, 2, 3, 5, 7, 9, 11], // W-H-W-W-W-W-H (上行形)
  [ScaleType.PENTATONIC_MAJOR]: [0, 2, 4, 7, 9], // メジャーペンタトニック
  [ScaleType.PENTATONIC_MINOR]: [0, 3, 5, 7, 10], // マイナーペンタトニック
  [ScaleType.BLUES]: [0, 3, 5, 6, 7, 10], // ブルーススケール
  [ScaleType.DORIAN]: [0, 2, 3, 5, 7, 9, 10], // ドリアン
  [ScaleType.PHRYGIAN]: [0, 1, 3, 5, 7, 8, 10], // フリジアン
  [ScaleType.LYDIAN]: [0, 2, 4, 6, 7, 9, 11], // リディアン
  [ScaleType.MIXOLYDIAN]: [0, 2, 4, 5, 7, 9, 10], // ミクソリディアン
  [ScaleType.LOCRIAN]: [0, 1, 3, 5, 6, 8, 10] // ロクリアン
};

// メジャースケールのダイアトニックコードパターン
const MAJOR_DIATONIC_PATTERN: ChordType[] = [
  ChordType.MAJOR,      // I
  ChordType.MINOR,      // ii
  ChordType.MINOR,      // iii
  ChordType.MAJOR,      // IV
  ChordType.MAJOR,      // V
  ChordType.MINOR,      // vi
  ChordType.DIMINISHED  // vii°
];

// ナチュラルマイナースケールのダイアトニックコードパターン
const NATURAL_MINOR_DIATONIC_PATTERN: ChordType[] = [
  ChordType.MINOR,      // i
  ChordType.DIMINISHED, // ii°
  ChordType.MAJOR,      // III
  ChordType.MINOR,      // iv
  ChordType.MINOR,      // v
  ChordType.MAJOR,      // VI
  ChordType.MAJOR       // VII
];

// スケール内の各度数のコード機能
const MAJOR_CHORD_FUNCTIONS: ChordFunction[] = [
  ChordFunction.TONIC,       // I
  ChordFunction.SUBDOMINANT, // ii
  ChordFunction.TONIC,       // iii
  ChordFunction.SUBDOMINANT, // IV
  ChordFunction.DOMINANT,    // V
  ChordFunction.TONIC,       // vi
  ChordFunction.DOMINANT     // vii°
];

const MINOR_CHORD_FUNCTIONS: ChordFunction[] = [
  ChordFunction.TONIC,       // i
  ChordFunction.SUBDOMINANT, // ii°
  ChordFunction.TONIC,       // III
  ChordFunction.SUBDOMINANT, // iv
  ChordFunction.DOMINANT,    // v
  ChordFunction.TONIC,       // VI
  ChordFunction.SUBDOMINANT  // VII
];

// スケールタイプの日本語表示名
const SCALE_TYPE_NAMES: Record<ScaleType, string> = {
  [ScaleType.MAJOR]: 'メジャー',
  [ScaleType.NATURAL_MINOR]: 'ナチュラルマイナー',
  [ScaleType.HARMONIC_MINOR]: 'ハーモニックマイナー',
  [ScaleType.MELODIC_MINOR]: 'メロディックマイナー',
  [ScaleType.PENTATONIC_MAJOR]: 'メジャーペンタトニック',
  [ScaleType.PENTATONIC_MINOR]: 'マイナーペンタトニック',
  [ScaleType.BLUES]: 'ブルース',
  [ScaleType.DORIAN]: 'ドリアン',
  [ScaleType.PHRYGIAN]: 'フリジアン',
  [ScaleType.LYDIAN]: 'リディアン',
  [ScaleType.MIXOLYDIAN]: 'ミクソリディアン',
  [ScaleType.LOCRIAN]: 'ロクリアン'
};

/**
 * 音名を正規化（フラットをシャープに変換）
 */
function normalizeNoteName(noteName: string): string {
  const flatToSharpMap: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  return flatToSharpMap[noteName] || noteName;
}

/**
 * ルート音から指定された音程だけ上の音名を取得
 */
function getNoteName(rootNote: string, semitones: number): string {
  const normalizedRoot = normalizeNoteName(rootNote);
  const rootIndex = NOTE_NAMES.indexOf(normalizedRoot);
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }
  
  const targetIndex = (rootIndex + semitones) % 12;
  return NOTE_NAMES[targetIndex];
}

/**
 * コード生成関数
 */
function createChord(
  name: string,
  fullName: string,
  noteNames: string[],
  rootNote: string,
  type: ChordType,
  degree?: number,
  chordFunction?: ChordFunction,
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
    type,
    degree,
    function: chordFunction
  };
}

/**
 * 3和音の構成音を生成
 */
function generateTriadNotes(rootNote: string, chordType: ChordType): string[] {
  const root = getNoteName(rootNote, 0);
  
  switch (chordType) {
    case ChordType.MAJOR:
      return [
        root,
        getNoteName(rootNote, 4), // 長3度
        getNoteName(rootNote, 7)  // 完全5度
      ];
    case ChordType.MINOR:
      return [
        root,
        getNoteName(rootNote, 3), // 短3度
        getNoteName(rootNote, 7)  // 完全5度
      ];
    case ChordType.DIMINISHED:
      return [
        root,
        getNoteName(rootNote, 3), // 短3度
        getNoteName(rootNote, 6)  // 減5度
      ];
    case ChordType.AUGMENTED:
      return [
        root,
        getNoteName(rootNote, 4), // 長3度
        getNoteName(rootNote, 8)  // 増5度
      ];
    default:
      throw new Error(`Unsupported chord type for triad: ${chordType}`);
  }
}

/**
 * スケールの構成音を生成
 */
export function generateScaleNotes(rootNote: string, scaleType: ScaleType): string[] {
  const pattern = SCALE_PATTERNS[scaleType];
  if (!pattern) {
    throw new Error(`Unsupported scale type: ${scaleType}`);
  }
  
  return pattern.map(semitones => getNoteName(rootNote, semitones));
}

/**
 * ダイアトニックコードを生成
 */
export function generateDiatonicChords(rootNote: string, scaleType: ScaleType): Chord[] {
  const scaleNotes = generateScaleNotes(rootNote, scaleType);
  
  // 7音階のスケールのみダイアトニックコードを生成
  if (scaleNotes.length !== 7) {
    return [];
  }
  
  let chordPattern: ChordType[];
  let functionPattern: ChordFunction[];
  
  switch (scaleType) {
    case ScaleType.MAJOR:
    case ScaleType.LYDIAN:
    case ScaleType.MIXOLYDIAN:
      chordPattern = MAJOR_DIATONIC_PATTERN;
      functionPattern = MAJOR_CHORD_FUNCTIONS;
      break;
    case ScaleType.NATURAL_MINOR:
    case ScaleType.DORIAN:
    case ScaleType.PHRYGIAN:
      chordPattern = NATURAL_MINOR_DIATONIC_PATTERN;
      functionPattern = MINOR_CHORD_FUNCTIONS;
      break;
    default:
      // その他のスケールは基本的なトライアドのみ生成
      chordPattern = scaleNotes.map(() => ChordType.MAJOR);
      functionPattern = scaleNotes.map(() => ChordFunction.TONIC);
  }
  
  return scaleNotes.map((note, index) => {
    const chordType = chordPattern[index];
    const chordFunction = functionPattern[index];
    const noteNames = generateTriadNotes(note, chordType);
    
    // コード名を生成
    let chordName = note;
    if (chordType === ChordType.MINOR) {
      chordName += 'm';
    } else if (chordType === ChordType.DIMINISHED) {
      chordName += 'dim';
    } else if (chordType === ChordType.AUGMENTED) {
      chordName += 'aug';
    }
    
    // フルネームを生成
    const typeNames: Record<ChordType, string> = {
      [ChordType.MAJOR]: 'Major',
      [ChordType.MINOR]: 'Minor',
      [ChordType.DIMINISHED]: 'Diminished',
      [ChordType.AUGMENTED]: 'Augmented',
      [ChordType.DOMINANT_7TH]: 'Dominant 7th',
      [ChordType.MAJOR_7TH]: 'Major 7th',
      [ChordType.MINOR_7TH]: 'Minor 7th',
      [ChordType.SUSPENDED_4TH]: 'Sus4',
      [ChordType.ADD_9TH]: 'Add9'
    };
    
    const fullName = `${note} ${typeNames[chordType]}`;
    
    return createChord(
      chordName,
      fullName,
      noteNames,
      note,
      chordType,
      index + 1, // 度数（1-7）
      chordFunction
    );
  });
}

/**
 * スケールを生成
 */
export function generateScale(rootNote: string, scaleType: ScaleType): Scale {
  const notes = generateScaleNotes(rootNote, scaleType);
  const chords = generateDiatonicChords(rootNote, scaleType);
  
  const scaleTypeName = SCALE_TYPE_NAMES[scaleType];
  const id = `${rootNote.toLowerCase()}-${scaleType}`;
  const name = `${rootNote}${scaleTypeName}`;
  
  return {
    id,
    name,
    rootNote,
    type: scaleType,
    notes,
    chords
  };
}

/**
 * 全12キーのメジャースケールを生成
 */
export function generateAllMajorScales(): Scale[] {
  const allKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return allKeys.map(key => generateScale(key, ScaleType.MAJOR));
}

/**
 * 全12キーのナチュラルマイナースケールを生成
 */
export function generateAllNaturalMinorScales(): Scale[] {
  const allKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return allKeys.map(key => generateScale(key, ScaleType.NATURAL_MINOR));
}

/**
 * プリセットスケール一覧
 */
export const PRESET_SCALES = {
  major: generateAllMajorScales(),
  naturalMinor: generateAllNaturalMinorScales()
};

/**
 * スケールIDからスケールを検索
 */
export function getScaleById(scaleId: string): Scale | undefined {
  const allScales = [...PRESET_SCALES.major, ...PRESET_SCALES.naturalMinor];
  return allScales.find(scale => scale.id === scaleId);
}

/**
 * ルート音とスケールタイプからスケールを検索
 */
export function getScale(rootNote: string, scaleType: ScaleType): Scale | undefined {
  const scaleId = `${rootNote.toLowerCase()}-${scaleType}`;
  return getScaleById(scaleId);
}
export { ScaleType };

