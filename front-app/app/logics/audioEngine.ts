/**
 * Tone.jsを使用した音声エンジン
 */
import * as Tone from 'tone';
import type { Chord, Note } from '../lib/types';

// 音声処理に関する定数
const DEFAULT_VOLUME = -10; // デシベル値 (-60〜0)
const NOTE_DURATION = '2n'; // 音の長さ（音符表記: 4n=四分音符, 2n=二分音符）
const ATTACK_TIME = 0.02; // 音の立ち上がり時間（秒）
const RELEASE_TIME = 0.5; // 音の余韻時間（秒）

/**
 * AudioEngine クラス
 * Tone.js を用いた音声再生エンジン
 */
class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private gainNode: Tone.Volume | null = null;
  private initialized = false;
  private activeNotes: string[] = []; // 現在再生中のノート
  
  /**
   * 初期化処理
   * ※ユーザージェスチャー後に呼び出す必要あり
   */
  public async init(): Promise<void> {
    if (!this.initialized) {
      try {
        // Tone.jsの初期化（ユーザージェスチャーが必要）
        await Tone.start();
        
        // 音量コントロール
        this.gainNode = new Tone.Volume(DEFAULT_VOLUME).toDestination();
        
        // シンセサイザー
        this.synth = new Tone.PolySynth().connect(this.gainNode);
        
        // エンベロープ設定
        this.synth.set({
          envelope: {
            attack: ATTACK_TIME,
            decay: 0.1,
            sustain: 0.5,
            release: RELEASE_TIME
          }
        });
        
        this.initialized = true;
        console.log('Tone.js AudioEngine initialized');
      } catch (error) {
        console.error('Failed to initialize Tone.js AudioEngine:', error);
      }
    }
  }

  /**
   * 音声エンジンの起動状態確認
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 単音を再生
   * @param note 音符オブジェクト
   */
  public playNote(note: Note): void {
    if (!this.synth || !this.initialized) {
      console.error('AudioEngine not initialized');
      return;
    }

    // ノート名とオクターブを組み合わせたTone.js形式に変換（例: 'C4'）
    const toneNote = `${note.name}${note.octave}`;
    
    // 音を再生
    this.synth.triggerAttackRelease(toneNote, NOTE_DURATION);
    
    // 追跡リストに追加
    this.activeNotes.push(toneNote);
  }
  /**
   * コード（和音）を再生
   * @param chord コードオブジェクト
   */
  public async playChord(chord: Chord): Promise<void> {
    // 初期化確認
    if (!this.initialized) {
      try {
        // Tone.jsのコンテキスト状態確認
        if (Tone.context.state !== 'running') {
          await Tone.start();
          console.log('Tone context started');
        }
        
        await this.init();
        
        if (!this.initialized) {
          throw new Error('AudioEngine initialization failed');
        }
      } catch (error) {
        console.error('AudioEngine 初期化エラー:', error);
        throw new Error('AudioEngine を初期化できません。ユーザー操作（クリックなど）が必要です。');
      }
    }
    
    if (!this.synth) {
      const error = new Error('Synth が初期化されていません');
      console.error(error);
      throw error;
    }
    
    // Tone.jsで使用する形式へ変換
    const toneNotes = chord.notes.map(note => `${note.name}${note.octave}`);
    
    console.log(`コード再生: ${chord.name}（構成音: ${toneNotes.join(', ')}）`);
    
    try {
      // Tone.js の状態を確認（念のため再確認）
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Tone context started in playChord');
      }
      
      // コード（複数の音）を同時に再生
      this.synth.triggerAttackRelease(toneNotes, NOTE_DURATION);
      
      // 追跡リストに追加
      this.activeNotes = [...this.activeNotes, ...toneNotes];
    } catch (error) {
      console.error('コード再生エラー:', error);
      throw error;
    }
  }

  /**
   * 再生中の音を全て停止
   */  public stopAll(): void {
    if (this.synth) {
      this.synth.releaseAll();
      this.activeNotes = [];
    }
  }

  /**
   * 音量設定
   * @param value 音量値（0.0〜1.0）
   * Tone.jsではデシベル値（-60〜0）に変換
   */
  public setVolume(value: number): void {
    if (this.gainNode) {
      // 0-1の値を-60-0のデシベル値に変換
      const dbValue = Tone.gainToDb(value);
      this.gainNode.volume.value = Math.max(-60, Math.min(0, dbValue));
    }
  }
}

// シングルトンインスタンス
export const audioEngine = new AudioEngine();

// トランスポート設定用ヘルパーメソッドを追加
export function setupToneTransport(bpm: number): void {
  // BPMの設定
  Tone.Transport.bpm.value = bpm;
}

// コード進行の再生
export function playChordProgression(
  chords: Chord[], 
  bpm: number, 
  onChordChange?: (index: number) => void
): (() => void) {
  if (!audioEngine.isInitialized()) {
    audioEngine.init().catch(err => {
      console.error('コード進行再生前の初期化エラー:', err);
      throw new Error('AudioEngine initialization failed');
    });
    
    if (!audioEngine.isInitialized()) {
      throw new Error('AudioEngine is not initialized');
    }
  }

  // トランスポートをリセット
  Tone.Transport.stop();
  Tone.Transport.cancel();
  
  // BPM設定
  Tone.Transport.bpm.value = bpm;
  
  // 1コードあたりの長さ（四分音符2つ分 = 2拍）
  const chordDuration = '2n';
  
  // シーケンス作成
  const seq = new Tone.Sequence(
    (time, idx) => {
      const index = Number(idx);
      const chord = chords[index];
      
      // 再生中のコードを全て停止
      audioEngine.stopAll();
      
      // 現在のコードを再生
      audioEngine.playChord(chord).catch(err => {
        console.error(`コード ${index} (${chord.name}) の再生に失敗:`, err);
      });
      
      // コールバック実行（UIの更新など）
      if (onChordChange) {
        onChordChange(index);
      }
    },
    [...Array(chords.length).keys()], // [0, 1, 2, ...] のインデックス配列
    chordDuration
  );
  
  // シーケンス開始
  seq.start(0);
  
  // トランスポート開始
  Tone.Transport.start();
  
  // クリーンアップ関数を返す
  return () => {
    seq.stop();
    Tone.Transport.stop();
    audioEngine.stopAll();
  };
}

// トランスポート停止関数
export function stopChordProgression(): void {
  Tone.Transport.stop();
  audioEngine.stopAll();
}

export default audioEngine;
