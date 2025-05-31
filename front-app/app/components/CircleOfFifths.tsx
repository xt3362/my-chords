/**
 * 五度圏（サークル・オブ・フィフス）コンポーネント
 */
import React, { useState, useEffect } from 'react';
import type { Chord, Scale } from '../lib/types';
import { ScaleType } from '../lib/types';
import { 
  CIRCLE_OF_FIFTHS_DATA,
  CIRCLE_OF_FIFTHS_KEYS,
  CIRCLE_MINOR_KEYS,
  type CircleKey,
  KEY_COLORS,
  getKeyInfo,
  getRelatedKeys
} from '../lib/circleOfFifths';
import audioEngine from '../logics/audioEngine';
import { getChordByName } from '../lib/chords';

// SVGのサイズ設定
const SVG_SIZE = 400;
const SVG_CENTER = SVG_SIZE / 2;

// コード表示の設定
const MAJOR_LABEL_OFFSET = 25;
const MINOR_LABEL_OFFSET = 15;

// コードのサイズ設定
const MAJOR_NODE_RADIUS = 25;
const MINOR_NODE_RADIUS = 20;
const HIGHLIGHT_SCALE = 1.15; // ハイライト時のスケール

interface CircleOfFifthsProps {
  onChordSelect: (chord: Chord) => void;
  selectedChord?: Chord | null;
  selectedScale?: Scale; // スケール情報を追加
}

/**
 * 五度圏（サークル・オブ・フィフス）コンポーネント
 */
export default function CircleOfFifths({ onChordSelect, selectedChord, selectedScale }: CircleOfFifthsProps) {
  // 状態管理
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [relatedKeys, setRelatedKeys] = useState<CircleKey[]>([]);
  
  // 選択中のキー名
  const selectedKeyName = selectedChord?.name || null;
    // 選択キーが変更されたときの処理
  useEffect(() => {
    if (selectedKeyName) {
      const relatedKeysList = getRelatedKeys(selectedKeyName);
      setRelatedKeys(relatedKeysList);
    } else {
      setRelatedKeys([]);
    }
  }, [selectedKeyName]);  /**
   * 音名を正規化（フラットをシャープに変換）
   */
  const normalizeNoteName = (noteName: string): string => {
    const flatToSharpMap: Record<string, string> = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    return flatToSharpMap[noteName] || noteName;
  };

  /**
   * 五度圏のキー名をスケールのコード名に変換
   */
  const circleKeyToScaleChord = (circleKeyName: string): string => {
    // マイナーキーかどうかを判定
    const isMinor = circleKeyName.endsWith('m');
    const baseKey = isMinor ? circleKeyName.slice(0, -1) : circleKeyName;
    
    // 五度圏とスケールの音名対応マップ
    const keyMap: Record<string, string> = {
      'Db': 'C#',
      'Eb': 'D#', 
      'Gb': 'F#',
      'Ab': 'G#',
      'Bb': 'A#'
    };
    
    const normalizedKey = keyMap[baseKey] || baseKey;
    return isMinor ? `${normalizedKey}m` : normalizedKey;
  };
  /**
   * キーがスケール内のコードかどうかを判定（改善版）
   */
  const isKeyInScale = (keyName: string): boolean => {
    if (!selectedScale) return true;
    
    // 五度圏のキー名をスケールのコード名に変換
    const scaleChordName = circleKeyToScaleChord(keyName);
    
    // スケール内のコード名と比較
    const scaleChordNames = selectedScale.chords.map(chord => chord.name);
    
    // 結果の判定
    const isInScale = scaleChordNames.includes(scaleChordName);
    
    // デバッグ情報（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log(`キー判定詳細: "${keyName}"`, {
        originalKey: keyName,
        convertedKey: scaleChordName,
        selectedScale: selectedScale.name,
        scaleChords: scaleChordNames,
        isInScale: isInScale
      });
    }
    
    return isInScale;
  };
  /**
   * スケールのルートキーかどうかを判定（改善版）
   */
  const isScaleRoot = (keyName: string): boolean => {
    if (!selectedScale) return false;
    
    // キー名を解析
    const isMinor = keyName.endsWith('m');
    const baseKeyName = isMinor ? keyName.slice(0, -1) : keyName;
    const normalizedKeyName = normalizeNoteName(baseKeyName);
    
    // スケールのルート音を正規化
    const normalizedRootNote = normalizeNoteName(selectedScale.rootNote);
    
    // スケールタイプとキータイプが一致するかチェック
    let isRoot = false;
    if (selectedScale.type === ScaleType.NATURAL_MINOR) {
      // マイナースケールの場合、マイナーキーと比較
      isRoot = isMinor && normalizedKeyName === normalizedRootNote;
    } else {
      // メジャースケールの場合、メジャーキーと比較
      isRoot = !isMinor && normalizedKeyName === normalizedRootNote;
    }
    
    // デバッグ情報（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log(`ルート判定: "${keyName}"`, {
        originalKey: keyName,
        isMinor,
        baseKey: baseKeyName,
        normalizedKey: normalizedKeyName,
        scaleRoot: normalizedRootNote,
        scaleType: selectedScale.type,
        isRoot
      });
    }
    
    return isRoot;
  };/**
   * キーがクリックされたときの処理
   */
  const handleKeyClick = (keyName: string) => {
    // スケール外のコードの場合は警告を表示
    if (!isKeyInScale(keyName)) {
      console.log(`"${keyName}" は現在のスケール（${selectedScale?.name}）に含まれていません`);
      // それでもコードは再生可能にする
    }

    // 新しいgetChordByName関数を使用してコードを取得
    const chord = getChordByName(keyName);
    
    if (chord) {
      // コードを再生
      if (audioEngine.isInitialized()) {
        audioEngine.playChord(chord);
      }
      
      // 選択コールバックを呼び出し
      onChordSelect(chord);
    } else {
      console.warn(`コード "${keyName}" が見つかりません`);
    }
  };
  
  /**
   * キーがホバーされたときの処理
   */
  const handleKeyHover = (keyName: string | null) => {
    setHoveredKey(keyName);
    
    // 関連キーをハイライト
    if (keyName) {
      const relatedKeysList = getRelatedKeys(keyName);
      setRelatedKeys(relatedKeysList);
    }
  };
    /**
   * キーの色を取得（スケール対応版）
   */
  const getKeyColor = (keyName: string) => {
    // 選択中または関連キーならハイライト
    const isSelected = keyName === selectedKeyName;
    const isRelated = relatedKeys.some(key => key.name === keyName);
    const isHovered = keyName === hoveredKey;
    const inScale = isKeyInScale(keyName);
    const isRoot = isScaleRoot(keyName);
    
    // キーのベース色を取得
    let baseColor = '#DDDDDD'; // デフォルト色
    
    // メジャーキーの場合、ベースカラーを使用
    const majorKeyName = keyName.endsWith('m') ? 
      keyName.substring(0, keyName.length - 1) : // Amの場合はA
      keyName;
    
    if (CIRCLE_OF_FIFTHS_KEYS.includes(majorKeyName)) {
      baseColor = KEY_COLORS[majorKeyName];
    }

    // スケール外のコードはグレーアウト
    if (!inScale) {
      return isSelected || isHovered ? `${baseColor}60` : '#E5E5E5'; // グレーアウト
    }

    // スケールのルートキーは特別な色で強調
    if (isRoot) {
      return isSelected || isHovered ? '#FF6B6B' : '#FF8E8E'; // 赤系で強調
    }
    
    // マイナーキーの場合は暗めに
    if (keyName.endsWith('m')) {
      // 色を少し暗くする
      return isSelected || isHovered ? baseColor : 
             isRelated ? `${baseColor}80` : // 50%透過度
             `${baseColor}60`;  // 38%透過度
    }
    
    // メジャーキーの場合
    return isSelected || isHovered ? baseColor : 
           isRelated ? `${baseColor}A0` : // 63%透過度
           `${baseColor}80`; // 50%透過度
  };
    /**
   * ノードのスケールを取得（スケール対応版）
   */
  const getNodeScale = (keyName: string) => {
    const isSelected = keyName === selectedKeyName;
    const isHovered = keyName === hoveredKey;
    const inScale = isKeyInScale(keyName);
    const isRoot = isScaleRoot(keyName);
    
    if (isSelected || isHovered) {
      return HIGHLIGHT_SCALE;
    }

    if (isRoot) {
      return 1.1; // ルートキーは少し大きく
    }
    
    if (!inScale) {
      return 0.8; // スケール外は小さく
    }
    
    return 1;
  };

  /**
   * ノードの透明度を取得
   */
  const getNodeOpacity = (keyName: string): number => {
    const inScale = isKeyInScale(keyName);
    return inScale ? 1.0 : 0.4; // スケール外は透明度を下げる
  };
    return (
    <div className="circle-of-fifths p-4 bg-gray-100 rounded-lg shadow-sm">      <div className="mb-3">
        <h2 className="text-xl font-semibold">五度圏</h2>
        {selectedScale && (
          <div className="text-sm text-gray-600 mt-1">
            <div className="font-medium">{selectedScale.name}</div>
            <div className="text-xs mt-1">
              スケール内コード: {selectedScale.chords.map(chord => chord.name).join(', ')}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>スケールルート</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>スケール内</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>スケール外</span>
              </div>
            </div>
          </div>
        )}
      </div>
        <div className="flex justify-center">
        <svg 
          width={SVG_SIZE} 
          height={SVG_SIZE} 
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="circle-of-fifths-svg"
          data-testid="circle-of-fifths-svg"
          role="img"
          aria-label="五度圏図"
        >
          {/* 外側の円（メジャーキー） */}
          <circle 
            cx={SVG_CENTER} 
            cy={SVG_CENTER} 
            r={MAJOR_LABEL_OFFSET + MAJOR_NODE_RADIUS + 30} 
            fill="none" 
            stroke="#CCCCCC" 
            strokeWidth="1" 
            strokeDasharray="3,3"
          />
          
          {/* 内側の円（マイナーキー） */}
          <circle 
            cx={SVG_CENTER} 
            cy={SVG_CENTER} 
            r={MINOR_LABEL_OFFSET + MINOR_NODE_RADIUS + 30} 
            fill="none" 
            stroke="#CCCCCC" 
            strokeWidth="1" 
            strokeDasharray="3,3"
          />
            {/* メジャーキーノード */}
          {CIRCLE_OF_FIFTHS_DATA.filter(key => key.isMajor).map(key => {
            const scale = getNodeScale(key.name);
            const opacity = getNodeOpacity(key.name);
            return (
              <g 
                key={key.name} 
                transform={`translate(${key.x}, ${key.y})`}
                onClick={() => handleKeyClick(key.name)}
                onMouseEnter={() => handleKeyHover(key.name)}
                onMouseLeave={() => handleKeyHover(null)}
                style={{ cursor: 'pointer', opacity }}
              >
                <circle 
                  cx="0" 
                  cy="0" 
                  r={MAJOR_NODE_RADIUS * scale} 
                  fill={getKeyColor(key.name)} 
                  stroke="#333333" 
                  strokeWidth="1"
                />
                <text 
                  x="0" 
                  y="0" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fontSize={16 * scale} 
                  fontWeight="bold"
                  fill="#333333"
                >
                  {key.name}
                </text>
              </g>
            );
          })}
            {/* マイナーキーノード */}
          {CIRCLE_OF_FIFTHS_DATA.filter(key => !key.isMajor).map(key => {
            const scale = getNodeScale(key.name);
            const opacity = getNodeOpacity(key.name);
            return (
              <g 
                key={key.name} 
                transform={`translate(${key.x}, ${key.y})`}
                onClick={() => handleKeyClick(key.name)}
                onMouseEnter={() => handleKeyHover(key.name)}
                onMouseLeave={() => handleKeyHover(null)}
                style={{ cursor: 'pointer', opacity }}
              >
                <circle 
                  cx="0" 
                  cy="0" 
                  r={MINOR_NODE_RADIUS * scale} 
                  fill={getKeyColor(key.name)} 
                  stroke="#333333" 
                  strokeWidth="1"
                />
                <text 
                  x="0" 
                  y="0" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fontSize={14 * scale} 
                  fontWeight="bold"
                  fill="#333333"
                >
                  {key.name}
                </text>
              </g>
            );
          })}
          
          {/* 中央ラベル */}
          <text 
            x={SVG_CENTER} 
            y={SVG_CENTER - 10} 
            textAnchor="middle" 
            fontSize="12"
            fill="#666666"
          >
            サークル・
          </text>
          <text 
            x={SVG_CENTER} 
            y={SVG_CENTER + 10} 
            textAnchor="middle" 
            fontSize="12"
            fill="#666666"
          >
            オブ・フィフス
          </text>
        </svg>
      </div>
      
      {/* 選択中のコードの情報表示 */}
      {selectedChord && (
        <div className="mt-4 p-3 bg-white border border-gray-300 rounded">
          <h3 className="text-lg font-medium text-gray-800 mt-0">{selectedChord.fullName}</h3>
          <p className="text-sm text-gray-600">構成音: {selectedChord.notes.map(note => note.name + note.octave).join(', ')}</p>
        </div>
      )}
      
      {/* ヘルプテキスト */}
      <div className="mt-4 text-sm text-gray-500">
        <p>※ 五度圏上のコードをクリックして選択できます。</p>
        <p>※ 外側の円はメジャーコード、内側の円はマイナーコードです。</p>
      </div>
    </div>
  );
}
