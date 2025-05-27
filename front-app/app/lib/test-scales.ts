/**
 * スケール機能のテストファイル
 * 作成したスケール生成機能が正しく動作するかテスト
 */
import { generateScale, generateAllMajorScales, generateAllNaturalMinorScales, ScaleType } from './scales';

// Cメジャースケールのテスト
console.log('=== Cメジャースケール ===');
const cMajor = generateScale('C', ScaleType.MAJOR);
console.log('スケール名:', cMajor.name);
console.log('構成音:', cMajor.notes);
console.log('ダイアトニックコード:');
cMajor.chords.forEach((chord, index) => {
  console.log(`  ${index + 1}. ${chord.name} (${chord.fullName}) - ${chord.function}`);
});

console.log('\n=== Aナチュラルマイナースケール ===');
const aMinor = generateScale('A', ScaleType.NATURAL_MINOR);
console.log('スケール名:', aMinor.name);
console.log('構成音:', aMinor.notes);
console.log('ダイアトニックコード:');
aMinor.chords.forEach((chord, index) => {
  console.log(`  ${index + 1}. ${chord.name} (${chord.fullName}) - ${chord.function}`);
});

console.log('\n=== 全メジャースケール一覧 ===');
const allMajorScales = generateAllMajorScales();
allMajorScales.forEach(scale => {
  console.log(`${scale.name}: ${scale.notes.join(', ')}`);
});

console.log('\n=== 全ナチュラルマイナースケール一覧 ===');
const allMinorScales = generateAllNaturalMinorScales();
allMinorScales.forEach(scale => {
  console.log(`${scale.name}: ${scale.notes.join(', ')}`);
});
