/**
 * コード選択コンポーネント
 */
import { useState, useEffect } from 'react';
import type { Chord } from '../lib/types';
import { C_MAJOR_CHORD_LIST } from '../lib/chords';
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
  };    // 表示モード切替処理
  const toggleDisplayMode = () => {
    setDisplayMode(prevMode => 
      prevMode === DisplayMode.LIST ? DisplayMode.CIRCLE : DisplayMode.LIST
    );
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
      
      {/* リスト表示モード */}
      {displayMode === DisplayMode.LIST && (
        <div className="grid grid-cols-4 gap-2 my-4">
          {C_MAJOR_CHORD_LIST.map(chord => (
            <button
              key={chord.name}
              className={`p-3 border rounded transition-all duration-200 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm ${
                selectedChord?.name === chord.name 
                  ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold' 
                  : 'bg-white border-gray-300'
              }`}
              onClick={() => handleChordClick(chord)}
            >
              {chord.name}
            </button>
          ))}
        </div>
      )}
      
      {/* 五度圏表示モード */}
      {displayMode === DisplayMode.CIRCLE && (
        <CircleOfFifths 
          onChordSelect={handleChordClick} 
          selectedChord={selectedChord}
        />
      )}
      
      {/* コード詳細表示（リスト表示モードのみ） */}
      {displayMode === DisplayMode.LIST && selectedChord && (
        <div className="mt-4 p-3 bg-white border border-gray-300 rounded">
          <h3 className="text-lg font-medium text-gray-800 mt-0">{selectedChord.fullName}</h3>
          <p className="text-sm text-gray-600">構成音: {selectedChord.notes.map(note => note.name + note.octave).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
