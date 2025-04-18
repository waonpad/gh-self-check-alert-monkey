# GitHubであれこれする時にセルフチェックを促すアラートを出すためのTampermonkeyスクリプト

## 対象のページ

- PR作成

## 使用方法

### Tampermonkeyのインストール

[Tampermonkey - Chrome ウェブストア](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja)

### ユーザースクリプトのインストール

https://github.com/waonpad/gh-self-check-alert-monkey/releases

### 対象ページに移動

対象ページに移動するとスクリプトが実行される。

## 開発

### プロジェクトのセットアップ

```bash
bun install
```

### ローカルサーバーの起動

```bash
bun dev
```

### ビルド

```bash
bun run build
```

### ローカルでビルドしたユーザースクリプトのインストール

```bash
bun run preview
```

### リリース

```bash
bun run release
```
