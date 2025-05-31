# GitHub Pages デプロイ手順

このアプリケーションをGitHub Pagesで公開するための手順です。

## 前提条件

1. GitHub上にpublicリポジトリを作成済み
2. ローカルにGitがインストール済み
3. Node.js環境が整備済み

## 手順

### 1. GitHub Pagesリポジトリの準備

1. GitHub上で新しいpublicリポジトリを作成（例: `my-chords-app`）
2. リポジトリの設定 > Pages > Source を "Deploy from a branch" に設定
3. Branch を "main" に設定

### 2. 初回デプロイ

```powershell
# front-appディレクトリに移動
cd front-app

# 依存関係をインストール（未実行の場合）
npm install

# GitHub Pagesにデプロイ
.\deploy-gh-pages.ps1 https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 3. 更新時のデプロイ

アプリケーションを更新した後は、同じコマンドを実行するだけです：

```powershell
.\deploy-gh-pages.ps1 https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## 設定の説明

### ベースパス設定

`vite.config.ts` で以下の設定により、GitHub Pagesのサブパスに対応：

```typescript
base: process.env.NODE_ENV === 'production' ? '/my-chords/' : '/',
```

**注意**: `/my-chords/` の部分はGitHub Pagesリポジトリ名と一致させてください。

### ビルドスクリプト

- `npm run build`: 通常のビルド
- `npm run build:gh-pages`: GitHub Pages用プロダクションビルド

## トラブルシューティング

### 1. ページが表示されない
- GitHub Pages の設定を確認
- ベースパス設定がリポジトリ名と一致しているか確認

### 2. アセットが読み込まれない
- `.nojekyll` ファイルが作成されているか確認
- ベースパス設定を再確認

### 3. 音声が再生されない
- HTTPS環境でのみTone.jsが動作することを確認
- ユーザーインタラクション後に音声を初期化

## 注意事項

- GitHub Pagesは静的サイトのみ対応
- 初回デプロイ後、反映まで数分かかる場合があります
- 大きなファイルサイズの場合、GitHub Pagesの制限に注意
