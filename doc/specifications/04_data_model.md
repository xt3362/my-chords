# データモデル設計テンプレート

## 1. コード進行データ構造（例: JSON）
```json
{
  "id": "string",
  "title": "string",
  "chords": [
    { "name": "C", "duration": 4 },
    { "name": "G", "duration": 4 }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "userId": "string"
}
```

## 2. ユーザーデータ構造（例）
```json
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "settings": { ... }
}
```

## 3. 保存・エクスポート形式
- ローカルストレージ
- エクスポート: JSON, MIDI, テキスト

---
> 実装時は必要に応じてフィールド追加・型調整を行うこと。
