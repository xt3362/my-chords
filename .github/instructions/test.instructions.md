---
applyTo: "src/**/*.test.tsx,src/**/*.spec.tsx,src/**/*.test.ts,src/**/*.spec.ts"
---

- テストは `@testing-library/react` を使って記述してください。
- 外部モジュールは `vi.mock` を使ってモック化してください。
- 実装ではなく、ユーザーの操作や見た目の振る舞いをテストしてください。
- describe / it ブロックの説明は何をテストしているか明確に記述してください。