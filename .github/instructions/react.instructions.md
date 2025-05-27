---
applyTo: "front-app/app/components/**/*.tsx,front-app/app/routes/**/*.tsx"
---

- クラスコンポーネントではなく、関数コンポーネントとフックを使ってください。
- props は TypeScript の interface または type で定義してください。
- スタイリングには Tailwind CSS を使用してください。
- JSX 内ではロジックを複雑にしすぎず、必要であれば関数に切り出してください。
- react-router v7 を使用してルーティングを管理してください。