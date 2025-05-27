# 単一の音階でコードを鳴らす実装タスク

## 環境構築
- [x] プロジェクト構造の確認と必要なディレクトリ作成
- [x] Web Audio API もしくは Tone.js の導入（package.jsonへの追加）
- [x] TypeScript 型定義の設定（必要に応じて）

## データモデル実装
- [x] コード（和音）の基本データ型を定義（`front-app/app/lib/types.ts`）
- [x] C Major スケール内のコード一覧の定義（`front-app/app/lib/chords.ts`）
- [x] コードごとの構成音データの実装（`front-app/app/lib/notes.ts`）

## UI実装
- [x] コード選択/表示コンポーネントの作成（`front-app/app/components/ChordSelector.tsx`）
- [x] 再生コントロールUIの実装（`front-app/app/components/PlaybackControls.tsx`）

## 音声機能実装
- [x] 音声エンジンの初期化ロジック実装（`front-app/app/logics/audioEngine.ts`）
- [x] 単音再生機能の実装
- [x] コード（和音）再生機能の実装
- [x] 音量調整機能の実装

## コード進行機能
- [x] コード進行配列の管理機能実装
- [x] コード追加・削除・並べ替え機能の実装
- [x] 進行の再生機能実装

## テスト・検証
- [ ] 各コードが正しい音程で再生されるか確認
- [ ] ブラウザ互換性の確認（Chrome, Firefox, Safari）
- [ ] モバイル環境での動作確認

## 備考
- 初期フェーズでは C Major スケールのみに対応
- 保存・共有機能は後のフェーズで実装予定
- 音源はシンセサイザーの基本波形（矩形波・サイン波など）を使用
