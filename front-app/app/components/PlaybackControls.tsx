/**
 * 再生コントロールコンポーネント
 */
import { useState, useEffect, useRef } from 'react';
import type { Chord } from '../lib/types';
import audioEngine, { playChordProgression, stopChordProgression, setupToneTransport } from '../logics/audioEngine';
import * as Tone from 'tone';

interface PlaybackControlsProps {
  chordProgression: Chord[];
  onBpmChange?: (bpm: number) => void;
}

export default function PlaybackControls({ 
  chordProgression, 
  onBpmChange 
}: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentChordIndex, setCurrentChordIndex] = useState<number>(-1);
  const [bpm, setBpm] = useState<number>(120);
  const [volume, setVolume] = useState<number>(0.5);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  // isPlayingの最新値をrefで保持してインターバル内でも正しく参照できるようにする
  const isPlayingRef = useRef<boolean>(false);
  
  // isPlaying状態が変更されたらrefも更新
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
    // オーディオ初期化と後片付け処理
  useEffect(() => {
    // ユーザージェスチャーがあった場合の初期化処理
    const initAudio = async () => {
      try {
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        
        if (!audioEngine.isInitialized()) {
          await audioEngine.init();
        }
        
        // トランスポート初期化
        setupToneTransport(bpm);
        console.log('Tone.js initialized in PlaybackControls');
        
        // イベントリスナーを削除（一度だけ実行）
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('keydown', initAudio);
      } catch (error) {
        console.error('Tone.js initialization failed:', error);
      }
    };
    
    // ユーザージェスチャー待ち（複数のイベントで対応）
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    document.addEventListener('keydown', initAudio);

    return () => {
      // クリーンアップ
      stopChordProgression();
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, [bpm]);
  
  // BPMからコード1つあたりの再生時間（ミリ秒）を計算
  const getChordDuration = () => (60 / bpm) * 1000;
  
  // 進行を再生
  const playProgression = () => {
    if (chordProgression.length === 0) return;
    
    // Tone.jsで再生する
    try {
      // 再生状態を更新
      setIsPlaying(true);
      isPlayingRef.current = true;
      
      // コード進行を再生開始
      playChordProgression(chordProgression, bpm, (index) => {
        // 現在のコードインデックスをUIに反映
        setCurrentChordIndex(index);
      });
    } catch (error) {
      console.error('コード進行再生エラー:', error);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };
  
  // 再生停止
  const stopPlayback = () => {
    // 状態を更新
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentChordIndex(-1);
    
    // Tone.jsの再生を停止
    stopChordProgression();
  };
  
  // 再生/停止ボタンクリック
  const handlePlayClick = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playProgression();
    }
  };
  
  // BPM変更処理（Tone.js対応）
  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value);
    setBpm(newBpm);
    
    // Tone.jsのBPMを更新
    setupToneTransport(newBpm);
    
    // 再生中なら再スタート
    if (isPlayingRef.current) {
      stopPlayback();
      // 少し遅延を入れて再開
      setTimeout(() => {
        playProgression();
      }, 50);
    }
    
    // コールバック呼び出し
    if (onBpmChange) {
      onBpmChange(newBpm);
    }
  };
  
  // 音量変更（Tone.js対応）
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioEngine.setVolume(newVolume);
    
    // デバッグ出力
    console.log(`音量設定: ${newVolume} (${Math.round(newVolume * 100)}%)`);
  };
    return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-sm mt-4">
      <div className="flex items-center justify-between mb-4">
        <button 
          className={`py-2 px-6 rounded font-bold text-white transition-colors ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } ${chordProgression.length === 0 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
          onClick={handlePlayClick}
          disabled={chordProgression.length === 0}
        >
          {isPlaying ? '停止' : '再生'}
        </button>
        
        <div className="flex flex-col flex-1 ml-4">
          <label htmlFor="bpm-slider" className="mb-1">テンポ: {bpm} BPM</label>
          <input
            id="bpm-slider"
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={handleBpmChange}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col w-full">
          <label htmlFor="volume-slider" className="mb-1">音量: {Math.round(volume * 100)}%</label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
          />
        </div>
      </div>
      
      {chordProgression.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 p-2 bg-white border border-gray-300 rounded">
          {chordProgression.map((chord, index) => (
            <span 
              key={`${chord.name}-${index}`} 
              className={`px-3 py-1 rounded ${
                currentChordIndex === index 
                  ? 'bg-blue-100 border border-blue-500 text-blue-700 font-bold' 
                  : 'bg-gray-100 border border-gray-300'
              }`}
            >
              {chord.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
