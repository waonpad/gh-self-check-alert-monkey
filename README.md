# GitHubとGitLabであれこれする時にセルフチェックを促すアラートを出すためのTampermonkeyスクリプト

## 対象のページ

- PR作成
- MR作成

## 使用方法

### Tampermonkeyのインストール

[Tampermonkey - Chrome ウェブストア](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja)

### ユーザースクリプトのインストール

https://github.com/waonpad/gh-self-check-alert-monkey/releases

### 対象ページに移動して実行

対象ページに移動するとアラートが出る。

#### 対象ページでキーボードショートカットから実行

対象ページで `command + B` を押すとアラートが出る。

## セルフホストのGitLabリポジトリで使用する場合

以下の2つの方法で対応できる。

### ビルド前に設定

[vite.config.ts](vite.config.ts)で対象リポジトリのURLを設定に追加してビルドする。

### ビルド後に設定

ビルド結果（[ユーザースクリプトのインストール](#ユーザースクリプトのインストール) からダウンロードしたものもこれ）のファイルの頭でコメントアウトされている部分に以下を追加する。

```javascript
// @match      <対象リポジトリのURL>/*
```

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
