---
applyTo: "front-app/app/**/*.test.tsx,front-app/app/**/*.spec.tsx,front-app/app/**/*.test.ts,front-app/app/**/*.spec.ts"
---

- テストは `@testing-library/react` を使って記述してください。
- 外部モジュールは `vi.mock` を使ってモック化してください。
- 実装ではなく、ユーザーの操作や見た目の振る舞いをテストしてください。
- describe / it ブロックの説明は何をテストしているか明確に記述してください。