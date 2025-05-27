import { useState } from 'react';
import type { Chord } from '../lib/types';
import ChordSelector from '../components/ChordSelector';
import PlaybackControls from '../components/PlaybackControls';
import { COMMON_CHORD_PROGRESSIONS } from '../lib/chords';

export default function ChordPlayer() {
  const [selectedChords, setSelectedChords] = useState<Chord[]>([]);
  const [bpm, setBpm] = useState<number>(120);
  
  // コード選択時の処理
  const handleChordSelect = (chord: Chord) => {
    setSelectedChords([...selectedChords, chord]);
  };
  
  // プリセット選択
  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    if (presetName === '') {
      setSelectedChords([]);
      return;
    }
    
    const preset = COMMON_CHORD_PROGRESSIONS[presetName as keyof typeof COMMON_CHORD_PROGRESSIONS];
    if (preset) {
      setSelectedChords([...preset]);
    }
  };
  
  // コード削除
  const handleRemoveChord = (index: number) => {
    const newChords = [...selectedChords];
    newChords.splice(index, 1);
    setSelectedChords(newChords);
  };
  
  // コードリセット
  const handleResetChords = () => {
    setSelectedChords([]);
  };
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MyChords - コード進行作成</h1>
      
      <div className="flex gap-6 mt-6">
        <div className="flex-1">
          <ChordSelector onChordSelect={handleChordSelect} />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">プリセット進行</h3>
            <select 
              className="w-full p-2 border border-gray-300 rounded"
              onChange={handlePresetSelect}
            >
              <option value="">選択してください</option>
              {Object.keys(COMMON_CHORD_PROGRESSIONS).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">コード進行</h2>
              <button 
                className={`py-1 px-3 rounded text-sm text-white ${
                  selectedChords.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                onClick={handleResetChords}
                disabled={selectedChords.length === 0}
              >
                リセット
              </button>
            </div>
            
            <div className="min-h-[100px] p-3 bg-white border border-gray-300 rounded flex flex-wrap gap-2">
              {selectedChords.length > 0 ? (
                selectedChords.map((chord, index) => (
                  <div key={`${chord.name}-${index}`} className="relative py-2 px-3 pr-6 bg-blue-50 border border-blue-300 rounded text-blue-600 font-medium">
                    <span>{chord.name}</span>
                    <button 
                      className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveChord(index)}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">コードを選択してください</p>
              )}
            </div>
          </div>
          
          <PlaybackControls 
            chordProgression={selectedChords}
            onBpmChange={setBpm}
          />
        </div>
      </div>    </div>
  );
}
