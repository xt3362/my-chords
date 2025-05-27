// デバッグ用ファイル - スケール情報の確認
const path = require('path');

// TypeScriptファイルを直接requireするためのtsxに対応
require('ts-node/register');

const { PRESET_SCALES } = require('./app/lib/scales.ts');

console.log('=== C Major Scale chords ===');
PRESET_SCALES.major[0].chords.forEach(chord => {
  console.log(`  ${chord.name} (${chord.fullName})`);
});

console.log('\n=== A Minor Scale chords ===');
PRESET_SCALES.minor[0].chords.forEach(chord => {
  console.log(`  ${chord.name} (${chord.fullName})`);
});

console.log('\n=== 五度圏のキー一覧 ===');
const { CIRCLE_OF_FIFTHS_KEYS, CIRCLE_MINOR_KEYS } = require('./app/lib/circleOfFifths.ts');
console.log('Major keys:', CIRCLE_OF_FIFTHS_KEYS);
console.log('Minor keys:', CIRCLE_MINOR_KEYS);
