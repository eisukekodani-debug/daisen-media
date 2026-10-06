# かってに議会だより

鳥取県大山町の議会の議案を、賛成・反対の両方から解説する地域ウェブメディア。設計は Googleドライブ `政治活動/地域ウェブメディア/サイト設計書` を参照。

## 手元で動かす
- `npm install`（初回だけ）
- `npm run dev` → http://localhost:4321/
- `npm run build:check` → 公開用のファイルを作り、点検する

## 公開
- `main` に push すると GitHub Actions がビルド・点検して GitHub Pages に公開する
- リポジトリの Variables で設定する値
  - `SITE_URL`：公開するURL（`https://katteni-dayori.com`）
  - `BASE_PATH`：独自ドメインなら `/`。github.io のプロジェクトページで試すときは `/リポジトリ名/`
  - `PUBLIC_NOINDEX`：公開日まで `1`（検索よけ）。公開の朝に `0` にする

## 直す場所
- サイト名・連絡先・フォームのURL：`src/config/site.ts`
- 議員定数のページ：`src/pages/teisu/index.astro`
- 色と書体：`src/styles/global.css`
