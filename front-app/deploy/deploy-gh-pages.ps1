# GitHub Pages デプロイスクリプト
# 使用方法: .\deploy-gh-pages.ps1 <github-pages-repo-url>

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubPagesRepoUrl
)

# エラーハンドリング設定
$ErrorActionPreference = "Stop"

# 定数定義
$TEMP_DIRECTORY_NAME = "temp-gh-pages"
$BUILD_COMMAND = "build:gh-pages"
$CLIENT_BUILD_PATH = "..\build\client\*"
$COMMIT_MESSAGE_PREFIX = "Deploy"
$DATE_FORMAT = "yyyy-MM-dd HH:mm:ss"
$BASE_PATH = "/pub.my-chords/"

Write-Host "GitHub Pages用のビルドを開始..." -ForegroundColor Green

# 環境変数を設定
$env:NODE_ENV = "production"
$env:VITE_BASE_PATH = $BASE_PATH

# 1. GitHub Pages用にビルド
npm run build:gh-pages

if ($LASTEXITCODE -ne 0) {
    Write-Error "ビルドが失敗しました"
    exit 1
}

# 2. 一時ディレクトリの作成とクリーンアップ
if (Test-Path $TEMP_DIRECTORY_NAME) {
    Remove-Item -Recurse -Force $TEMP_DIRECTORY_NAME
}

# 3. GitHub Pagesリポジトリをクローン
Write-Host "GitHub Pagesリポジトリをクローン中..." -ForegroundColor Green
git clone $GitHubPagesRepoUrl $TEMP_DIRECTORY_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Error "リポジトリのクローンに失敗しました"
    exit 1
}

# 4. 既存のファイルを削除（.gitを除く）
Push-Location $TEMP_DIRECTORY_NAME
try {
    Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force
} catch {
    Write-Warning "既存ファイルの削除中にエラーが発生しました: $_"
}
Pop-Location

# 5. ビルド成果物をコピー
Write-Host "ビルド成果物をコピー中..." -ForegroundColor Green
Copy-Item -Path $CLIENT_BUILD_PATH -Destination $TEMP_DIRECTORY_NAME -Recurse

# 6. GitHub Pages用の設定ファイルを追加
$readmeContent = @"
# My Chords App

This is a static build of the My Chords application for GitHub Pages.

## 🎵 Features
- Interactive chord progression creation
- Circle of fifths visualization
- Audio playback with Tone.js
- Modern React-based UI

Visit: [Live Demo](https://username.github.io/my-chords/)
"@

$readmeContent | Out-File -FilePath "$TEMP_DIRECTORY_NAME\README.md" -Encoding UTF8

# .nojekyll ファイルを作成（Jekyll処理をスキップ）
New-Item -Path "$TEMP_DIRECTORY_NAME\.nojekyll" -ItemType File -Force | Out-Null

# 7. Git操作
Push-Location $TEMP_DIRECTORY_NAME

Write-Host "変更をコミット中..." -ForegroundColor Green
git add .
$commitMessage = "$COMMIT_MESSAGE_PREFIX`: $(Get-Date -Format $DATE_FORMAT)"
git commit -m $commitMessage

Write-Host "GitHub Pagesにプッシュ中..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ デプロイが完了しました！" -ForegroundColor Green
    Write-Host "数分後に以下のURLでアクセス可能になります:" -ForegroundColor Yellow
    
    # リポジトリ名とユーザー名を抽出
    $repoNameWithExtension = ($GitHubPagesRepoUrl -split '/')[-1]
    $repositoryName = $repoNameWithExtension -replace '\.git$', ''
    $githubUsername = ($GitHubPagesRepoUrl -split '/')[-2]
    
    Write-Host "https://$githubUsername.github.io/$repositoryName/" -ForegroundColor Cyan
} else {
    Write-Error "プッシュに失敗しました"
}

Pop-Location

# 8. クリーンアップ
Write-Host "一時ファイルをクリーンアップ中..." -ForegroundColor Green
Remove-Item -Recurse -Force $TEMP_DIRECTORY_NAME

Write-Host "🎉 すべて完了しました！" -ForegroundColor Green
