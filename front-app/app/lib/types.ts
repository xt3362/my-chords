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
};

/**
 * コード進行の定義
 */
export type ChordProgression = {
  id: string;
  name: string;
  chords: Chord[];
  bpm: number;      // テンポ
};

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
