/**
 * コード選択コンポーネント
 */
import { useState, useEffect } from 'react';
import type { Chord, Scale } from '../lib/types';
import { ScaleType, ChordFunction } from '../lib/types';
import { C_MAJOR_CHORD_LIST } from '../lib/chords';
import { PRESET_SCALES, getScale, generateScale } from '../lib/scales';
import audioEngine from '../logics/audioEngine';
import * as Tone from 'tone';
import CircleOfFifths from './CircleOfFifths';

// 表示モードの定義
enum DisplayMode {
  LIST = 'list',
  CIRCLE = 'circle'
}

interface ChordSelectorProps {
  onChordSelect: (chord: Chord) => void;
}

export default function ChordSelector({ onChordSelect }: ChordSelectorProps) {
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  // 表示モードの状態（デフォルトはリスト表示）
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);
  // スケール選択の状態
  const [selectedScale, setSelectedScale] = useState<Scale>(PRESET_SCALES.major[0]); // C Major
  const [currentChords, setCurrentChords] = useState<Chord[]>(PRESET_SCALES.major[0].chords);
  
  // 初回レンダリング後にオーディオ初期化のセットアップ
  useEffect(() => {
    const setupAudioContext = async () => {
      // ユーザーインタラクションがあった場合の処理
      const initializeAudio = async () => {
        if (!audioEngine.isInitialized()) {
          try {
            await Tone.start();
            await audioEngine.init();
            console.log('オーディオエンジンの初期化が完了しました');
            setAudioInitialized(true);
            // イベントリスナーを削除（一度だけ実行）
            document.removeEventListener('click', initializeAudio);
            document.removeEventListener('touchstart', initializeAudio);
            document.removeEventListener('keydown', initializeAudio);
          } catch (error) {
            console.error('オーディオエンジン初期化エラー:', error);
          }
        }
      };
      
      // ユーザージェスチャー待ち（イベントリスナーで初期化）
      document.addEventListener('click', initializeAudio);
      document.addEventListener('touchstart', initializeAudio);
      document.addEventListener('keydown', initializeAudio);
      
      // クリーンアップ関数
      return () => {
        document.removeEventListener('click', initializeAudio);
        document.removeEventListener('touchstart', initializeAudio);
        document.removeEventListener('keydown', initializeAudio);
      };
    };
    
    setupAudioContext();
  }, []);
  
  // コードクリック時の処理
  const handleChordClick = async (chord: Chord) => {
    try {
      // 音声エンジンが初期化されていない場合は初期化（非同期処理を待機）
      if (!audioEngine.isInitialized()) {
        await Tone.start();
        await audioEngine.init();
        setAudioInitialized(true);
        console.log('コード選択時の音声エンジン初期化完了');
      }
      
      // コード再生
      audioEngine.playChord(chord);
      
      // 選択状態更新
      setSelectedChord(chord);
      
      // 親コンポーネントに通知
      onChordSelect(chord);
    } catch (error) {
      console.error('コード再生エラー:', error);
    }
  };  // 表示モード切替処理
  const toggleDisplayMode = () => {
    setDisplayMode(prevMode => 
      prevMode === DisplayMode.LIST ? DisplayMode.CIRCLE : DisplayMode.LIST
    );
  };

  // スケール変更処理
  const handleScaleChange = (rootNote: string, scaleType: ScaleType) => {
    const scale = getScale(rootNote, scaleType);
    if (scale) {
      setSelectedScale(scale);
      setCurrentChords(scale.chords);
      setSelectedChord(null); // 選択中のコードをリセット
    }
  };
  // コード機能に基づく色分け
  const getChordFunctionColor = (chordFunction?: ChordFunction): string => {
    switch (chordFunction) {
      case ChordFunction.TONIC:
        return 'bg-blue-50 border-blue-500 text-blue-600 hover:bg-blue-100';
      case ChordFunction.SUBDOMINANT:
        return 'bg-green-50 border-green-500 text-green-600 hover:bg-green-100';
      case ChordFunction.DOMINANT:
        return 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100';
    }
  };

  // デバッグ用関数
  const debugScaleInfo = () => {
    console.log('=== デバッグ情報 ===');
    console.log('現在のスケール:', selectedScale);
    console.log('スケール内のコード:', selectedScale.chords.map(chord => ({
      name: chord.name,
      fullName: chord.fullName,
      degree: chord.degree,
      function: chord.function
    })));
    
    // 五度圏データも表示
    import('../lib/circleOfFifths').then(module => {
      console.log('五度圏メジャーキー:', module.CIRCLE_OF_FIFTHS_KEYS);
      console.log('五度圏マイナーキー:', module.CIRCLE_MINOR_KEYS);
    });
  };

  // ローマ数字表記を取得
  const getRomanNumeral = (degree?: number, chordFunction?: ChordFunction): string => {
    if (!degree) return '';
    
    const majorNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const minorNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    
    // メジャースケールかマイナースケールかで使い分け
    const numerals = selectedScale.type === ScaleType.MAJOR ? majorNumerals : minorNumerals;
    return numerals[degree - 1] || '';
  };
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">コード選択</h2>
        
        {/* 表示モード切替ボタン */}
        <button
          onClick={toggleDisplayMode}
          className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          {displayMode === DisplayMode.LIST ? '五度圏表示' : 'リスト表示'}
        </button>
      </div>

      {/* スケール選択セクション */}
      {displayMode === DisplayMode.LIST && (
        <div className="mb-4 p-3 bg-white border border-gray-300 rounded">
          <h3 className="text-sm font-medium text-gray-700 mb-2">スケール選択</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* キー選択 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">キー</label>
              <select
                value={selectedScale.rootNote}
                onChange={(e) => handleScaleChange(e.target.value, selectedScale.type)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            
            {/* スケールタイプ選択 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">スケールタイプ</label>
              <select
                value={selectedScale.type}
                onChange={(e) => handleScaleChange(selectedScale.rootNote, e.target.value as ScaleType)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ScaleType.MAJOR}>メジャー</option>
                <option value={ScaleType.NATURAL_MINOR}>ナチュラルマイナー</option>
              </select>
            </div>
          </div>
          
          {/* 現在のスケール表示 */}
          <div className="mt-2 text-sm text-gray-600">
            現在のスケール: <span className="font-medium text-gray-800">{selectedScale.name}</span>
          </div>
        </div>
      )}
      
      {/* リスト表示モード */}
      {displayMode === DisplayMode.LIST && (
        <div>
          {/* コード機能の凡例 */}
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>トニック</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>サブドミナント</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>ドミナント</span>
            </div>
          </div>
          
          {/* コード一覧 */}
          <div className="grid grid-cols-4 gap-2 my-4">
            {currentChords.map(chord => (
              <button
                key={chord.name}
                className={`p-3 border rounded transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                  selectedChord?.name === chord.name 
                    ? 'font-bold shadow-md transform -translate-y-0.5' 
                    : ''
                } ${getChordFunctionColor(chord.function)}`}
                onClick={() => handleChordClick(chord)}
              >
                <div className="text-center">
                  <div className="font-medium">{chord.name}</div>
                  <div className="text-xs opacity-70">{getRomanNumeral(chord.degree, chord.function)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
        {/* 五度圏表示モード */}
      {displayMode === DisplayMode.CIRCLE && (
        <CircleOfFifths 
          onChordSelect={handleChordClick} 
          selectedChord={selectedChord}
          selectedScale={selectedScale}
        />
      )}
      
      {/* コード詳細表示（リスト表示モードのみ） */}
      {displayMode === DisplayMode.LIST && selectedChord && (
        <div className="mt-4 p-3 bg-white border border-gray-300 rounded">
          <h3 className="text-lg font-medium text-gray-800 mt-0">
            {selectedChord.fullName}
            {selectedChord.degree && (
              <span className="ml-2 text-sm text-gray-600">
                ({getRomanNumeral(selectedChord.degree, selectedChord.function)})
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600">構成音: {selectedChord.notes.map(note => note.name + note.octave).join(', ')}</p>
          {selectedChord.function && (
            <p className="text-sm text-gray-600">
              コード機能: <span className="font-medium">
                {selectedChord.function === ChordFunction.TONIC && 'トニック（安定）'}
                {selectedChord.function === ChordFunction.SUBDOMINANT && 'サブドミナント（やや不安定）'}
                {selectedChord.function === ChordFunction.DOMINANT && 'ドミナント（不安定・解決感を求める）'}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
