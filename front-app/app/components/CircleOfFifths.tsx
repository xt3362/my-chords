/**
 * 五度圏（サークル・オブ・フィフス）コンポーネント
 */
import React, { useState, useEffect } from 'react';
import type { Chord } from '../lib/types';
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
}

/**
 * 五度圏（サークル・オブ・フィフス）コンポーネント
 */
export default function CircleOfFifths({ onChordSelect, selectedChord }: CircleOfFifthsProps) {
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
  }, [selectedKeyName]);
    /**
   * キーがクリックされたときの処理
   */
  const handleKeyClick = (keyName: string) => {
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
   * キーの色を取得（ベースはKEY_COLORSから、ただし状態によって変更）
   */
  const getKeyColor = (keyName: string) => {
    // 選択中または関連キーならハイライト
    const isSelected = keyName === selectedKeyName;
    const isRelated = relatedKeys.some(key => key.name === keyName);
    const isHovered = keyName === hoveredKey;
    
    // キーのベース色を取得
    let baseColor = '#DDDDDD'; // デフォルト色
    
    // メジャーキーの場合、ベースカラーを使用
    const majorKeyName = keyName.endsWith('m') ? 
      keyName.substring(0, keyName.length - 1) : // Amの場合はA
      keyName;
    
    if (CIRCLE_OF_FIFTHS_KEYS.includes(majorKeyName)) {
      baseColor = KEY_COLORS[majorKeyName];
    }
    
    // マイナーキーの場合は暗めに
    if (keyName.endsWith('m')) {
      // 色を少し暗くする
      return isSelected || isHovered ? baseColor : 
             isRelated ? `${baseColor}80` : // 50%透過度
             `${baseColor}40`;  // 25%透過度
    }
    
    // メジャーキーの場合
    return isSelected || isHovered ? baseColor : 
           isRelated ? `${baseColor}A0` : // 63%透過度
           `${baseColor}70`; // 44%透過度
  };
  
  /**
   * ノードのスケールを取得
   */
  const getNodeScale = (keyName: string) => {
    const isSelected = keyName === selectedKeyName;
    const isHovered = keyName === hoveredKey;
    
    if (isSelected || isHovered) {
      return HIGHLIGHT_SCALE;
    }
    
    return 1;
  };
  
  return (
    <div className="circle-of-fifths p-4 bg-gray-100 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-3">五度圏</h2>
      
      <div className="flex justify-center">
        <svg 
          width={SVG_SIZE} 
          height={SVG_SIZE} 
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="circle-of-fifths-svg"
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
            return (
              <g 
                key={key.name} 
                transform={`translate(${key.x}, ${key.y})`}
                onClick={() => handleKeyClick(key.name)}
                onMouseEnter={() => handleKeyHover(key.name)}
                onMouseLeave={() => handleKeyHover(null)}
                style={{ cursor: 'pointer' }}
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
            return (
              <g 
                key={key.name} 
                transform={`translate(${key.x}, ${key.y})`}
                onClick={() => handleKeyClick(key.name)}
                onMouseEnter={() => handleKeyHover(key.name)}
                onMouseLeave={() => handleKeyHover(null)}
                style={{ cursor: 'pointer' }}
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
