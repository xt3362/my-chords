/**
 * 音符の定義
 */
export type Note = {
  name: string;    // 音名 (例: 'C', 'D#')
  octave: number;  // オクターブ (例: 4, 5)
  frequency: number; // 周波数 (Hz)
};

/**
 * コード（和音）の定義
 */
export type Chord = {
  name: string;      // コード名 (例: 'C', 'Am7')
  fullName: string;  // フルネーム (例: 'C Major', 'A Minor 7th')
  notes: Note[];     // 構成音
  rootNote: string;  // ルート音 (例: 'C', 'A')
  type: ChordType;   // コードタイプ
  position?: number; // 五度圏上での位置（オプション）
  degree?: number;   // スケール内での度数（1-7）
  function?: ChordFunction; // コード機能（トニック、ドミナントなど）
};

/**
 * コード進行の定義
 */
export type ChordProgression = {
  id: string;
  name: string;
  chords: Chord[];
  bpm: number;      // テンポ
  scale?: Scale;    // 進行のスケール情報
};

/**
 * スケールの定義
 */
export type Scale = {
  id: string;        // スケールID (例: 'C-major', 'Am-natural-minor')
  name: string;      // 表示名 (例: 'Cメジャー', 'Aナチュラルマイナー')
  rootNote: string;  // ルート音 (例: 'C', 'A')
  type: ScaleType;   // スケールタイプ
  notes: string[];   // スケールの構成音 (例: ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  chords: Chord[];   // ダイアトニックコード
};

/**
 * スケールタイプの定義
 */
export enum ScaleType {
  MAJOR = 'major',
  NATURAL_MINOR = 'natural_minor',
  HARMONIC_MINOR = 'harmonic_minor',
  MELODIC_MINOR = 'melodic_minor',
  PENTATONIC_MAJOR = 'pentatonic_major',
  PENTATONIC_MINOR = 'pentatonic_minor',
  BLUES = 'blues',
  DORIAN = 'dorian',
  PHRYGIAN = 'phrygian',
  LYDIAN = 'lydian',
  MIXOLYDIAN = 'mixolydian',
  LOCRIAN = 'locrian'
}

/**
 * コード機能の定義
 */
export enum ChordFunction {
  TONIC = 'tonic',           // トニック（安定）
  SUBDOMINANT = 'subdominant', // サブドミナント（やや不安定）
  DOMINANT = 'dominant',     // ドミナント（不安定、解決を求める）
  SECONDARY_DOMINANT = 'secondary_dominant', // 副属和音
  BORROWED = 'borrowed'      // 借用和音
}

/**
 * コードタイプの定義
 */
export enum ChordType {
  MAJOR = 'major',
  MINOR = 'minor',
  DOMINANT_7TH = 'dominant7',
  MAJOR_7TH = 'major7',
  MINOR_7TH = 'minor7',
  DIMINISHED = 'diminished',
  AUGMENTED = 'augmented',
  SUSPENDED_4TH = 'sus4',
  ADD_9TH = 'add9'
}
