/**
 * 五度圏（サークル・オブ・フィフス）の定義
 */
import { ChordType } from './types';
import { NOTE_NAMES } from './notes';

// 五度圏で表示する際の定数
const TOTAL_KEYS = 12; // 全調の数
const MAJOR_RADIUS = 150; // 外側の円（メジャーコード）の半径
const MINOR_RADIUS = 110; // 内側の円（マイナーコード）の半径
const CENTER_X = 200; // SVG中心のX座標
const CENTER_Y = 200; // SVG中心のY座標

/**
 * 五度圏上のキー（調）の定義
 */
export interface CircleKey {
  // 基本情報
  name: string;           // キー名（例: 'C', 'G'）
  position: number;       // 五度圏上の位置（0=C、時計回りに増加）
  
  // 五度圏上での表示位置
  x: number;              // SVG上のX座標
  y: number;              // SVG上のY座標
  
  // 関連情報
  fifthUp: string;        // 5度上のキー
  fifthDown: string;      // 5度下のキー
  relativeMinor: string;  // 平行短調のキー（メジャーキーの場合）
  relativeMajor: string;  // 平行長調のキー（マイナーキーの場合）
  
  // 和音情報
  isMajor: boolean;       // メジャーキーかどうか
  chordName: string;      // コード名
}

/**
 * 五度圏の生成
 * 
 * 五度圏の順番: C, G, D, A, E, B, F#/Gb, Db, Ab, Eb, Bb, F
 */

// メジャーキーの五度圏（時計回り）
export const CIRCLE_OF_FIFTHS_KEYS: string[] = [
  'C', 'G', 'D', 'A', 'E', 'B',
  'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'
];

// 各キーと平行調の関係
const RELATIVE_MINORS: Record<string, string> = {
  'C': 'Am',
  'G': 'Em', 
  'D': 'Bm',
  'A': 'F#m',
  'E': 'C#m',
  'B': 'G#m',
  'F#': 'D#m',
  'Db': 'Bbm',
  'Ab': 'Fm',
  'Eb': 'Cm',
  'Bb': 'Gm',
  'F': 'Dm'
};

// 五度圏のマイナーキー（内側の円）
export const CIRCLE_MINOR_KEYS = CIRCLE_OF_FIFTHS_KEYS.map(key => RELATIVE_MINORS[key]);

/**
 * 色のマッピング（キーごとの色定義）
 */
export const KEY_COLORS: Record<string, string> = {
  'C': '#FF0000',  // 赤
  'G': '#FF7F00',  // オレンジ
  'D': '#FFFF00',  // 黄
  'A': '#7FFF00',  // 黄緑
  'E': '#00FF00',  // 緑
  'B': '#00FF7F',  // ミント
  'F#': '#00FFFF', // シアン
  'Db': '#007FFF', // 水色
  'Ab': '#0000FF', // 青
  'Eb': '#7F00FF', // 紫
  'Bb': '#FF00FF', // マゼンタ
  'F': '#FF007F',  // ピンク
};

/**
 * 五度圏上の位置からSVG座標を計算
 * @param position 五度圏上の位置（0=C, 時計回りに増加）
 * @param isMajor メジャーキーかどうか
 * @returns {x, y} SVG上の座標
 */
function calculateCoordinates(position: number, isMajor: boolean): { x: number, y: number } {
  // 円周上の角度（ラジアン）: C=12時の位置から時計回りに
  const angleInRadians = ((position * 30) - 90) * (Math.PI / 180);
  
  // 使用する半径（メジャー/マイナー）
  const radius = isMajor ? MAJOR_RADIUS : MINOR_RADIUS;
  
  // 座標計算
  const x = CENTER_X + radius * Math.cos(angleInRadians);
  const y = CENTER_Y + radius * Math.sin(angleInRadians);
  
  return { x, y };
}

/**
 * 五度圏上のすべてのキー情報を生成
 */
export function generateCircleOfFifths(): CircleKey[] {
  const allKeys: CircleKey[] = [];
  
  // メジャーキーを生成
  CIRCLE_OF_FIFTHS_KEYS.forEach((keyName, index) => {
    const position = index;
    const coords = calculateCoordinates(position, true);
    
    // 5度上と5度下のキーを計算（循環）
    const fifthUpIndex = (index + 1) % TOTAL_KEYS;
    const fifthDownIndex = (index - 1 + TOTAL_KEYS) % TOTAL_KEYS;
    
    const majorKey: CircleKey = {
      name: keyName,
      position,
      x: coords.x,
      y: coords.y,
      fifthUp: CIRCLE_OF_FIFTHS_KEYS[fifthUpIndex],
      fifthDown: CIRCLE_OF_FIFTHS_KEYS[fifthDownIndex],
      relativeMinor: RELATIVE_MINORS[keyName],
      relativeMajor: '',  // メジャーキーには平行長調なし
      isMajor: true,
      chordName: keyName
    };
    
    allKeys.push(majorKey);
    
    // 対応するマイナーキーも生成
    const minorKeyName = RELATIVE_MINORS[keyName];
    const minorCoords = calculateCoordinates(position, false);
    
    const minorKey: CircleKey = {
      name: minorKeyName,
      position,
      x: minorCoords.x,
      y: minorCoords.y,
      fifthUp: RELATIVE_MINORS[CIRCLE_OF_FIFTHS_KEYS[fifthUpIndex]],
      fifthDown: RELATIVE_MINORS[CIRCLE_OF_FIFTHS_KEYS[fifthDownIndex]],
      relativeMinor: '',  // マイナーキーには平行短調なし
      relativeMajor: keyName,
      isMajor: false,
      chordName: minorKeyName
    };
    
    allKeys.push(minorKey);
  });
  
  return allKeys;
}

// 五度圏のデータを事前生成
export const CIRCLE_OF_FIFTHS_DATA = generateCircleOfFifths();

/**
 * キー名から五度圏上のキー情報を取得
 */
export function getKeyInfo(keyName: string): CircleKey | undefined {
  return CIRCLE_OF_FIFTHS_DATA.find(key => key.name === keyName);
}

/**
 * キー名に対する関連キーを取得
 */
export function getRelatedKeys(keyName: string): CircleKey[] {
  const keyInfo = getKeyInfo(keyName);
  if (!keyInfo) return [];
  
  // 関連キー（5度上、5度下、平行調）を取得
  return CIRCLE_OF_FIFTHS_DATA.filter(key => {
    return key.name === keyInfo.fifthUp ||
           key.name === keyInfo.fifthDown ||
           key.name === (keyInfo.isMajor ? keyInfo.relativeMinor : keyInfo.relativeMajor);
  });
}
