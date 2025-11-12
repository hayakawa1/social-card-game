# Social Card Game

PC向けソーシャルカードゲーム - Next.js 16フルスタックアプリケーション

## 🎮 プロジェクト概要

プレイヤーがカードを収集し、デッキを構築して他のプレイヤーやAIと戦う戦略的なカードバトルゲームです。

### 主な機能

- ✅ **プレイヤー管理**: アカウント作成、プロフィール編集、レベル・経験値システム
- ✅ **カードシステム**: 30種類以上のカード、6属性、4レアリティ
- ✅ **デッキ構築**: 最大5つのデッキ、20-40枚のカード構成
- ✅ **ガチャシステム**: 単発・10連ガチャ、確率システム、保証機能
- ✅ **クエストシステム**: 4難易度、スタミナ消費、報酬システム
- ✅ **ソーシャル機能**: フレンド最大50人、ランキングシステム
- ✅ **通貨システム**: ゴールド（無料通貨）、ジェム（有料通貨）
- ✅ **スタミナシステム**: 5分で1ポイント自動回復
- ✅ **デイリーログインボーナス**: 連続ログイン報酬
- ⏳ **バトルシステム**: ターン制カードバトル（実装予定）
- ⏳ **Web通知システム**: ブラウザ通知（実装予定）

## 🛠 技術スタック

### フロントエンド
- **Next.js 16** (App Router + Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (状態管理)
- **SWR** (データフェッチング)
- **Framer Motion** (アニメーション)
- **React Hook Form** + **Zod** (フォーム管理)

### バックエンド
- **Next.js API Routes**
- **Drizzle ORM**
- **SQLite**（better-sqlite3 + Drizzle）
- **Redis**（キャッシュ／将来の拡張用）
- **NextAuth.js v5** (認証)
- **bcryptjs** (パスワードハッシュ化)

## 📁 プロジェクト構造

```
social-card-game/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認証画面
│   ├── (game)/              # ゲーム画面
│   ├── api/                 # API Routes
│   │   ├── auth/           # 認証API
│   │   ├── player/         # プレイヤーAPI
│   │   ├── cards/          # カードAPI
│   │   ├── decks/          # デッキAPI
│   │   ├── gacha/          # ガチャAPI
│   │   ├── quests/         # クエストAPI
│   │   └── social/         # ソーシャルAPI
│   ├── layout.tsx
│   └── page.tsx
├── components/               # Reactコンポーネント
│   ├── ui/                  # shadcn/ui
│   ├── game/                # ゲーム固有
│   └── layout/              # レイアウト
├── lib/                      # ユーティリティ
│   ├── db/                  # Drizzle DB
│   ├── auth/                # NextAuth
│   ├── redis/               # Redis
│   ├── services/            # ビジネスロジック
│   └── utils/               # ヘルパー関数
├── drizzle/                  # Drizzle ORM
│   ├── schema.ts            # DBスキーマ
│   ├── seed.ts              # シードデータ
│   └── migrations/          # マイグレーション
├── hooks/                    # カスタムフック
├── stores/                   # Zustand ストア
├── types/                    # TypeScript型定義
└── public/                   # 静的ファイル
```

## 🚀 セットアップ

### 必要な環境

- Node.js 18以上
- SQLite 3（ローカルファイル `social-card-game.db` を使用）

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して SQLite ファイルのパスや NextAuth の値を設定

# データベースマイグレーション
npm run db:push

# シードデータの投入
npm run db:seed

# 開発サーバーの起動
npm run dev
```

※ `social-card-game.db` に初期データ（DEV_USER など）が投入されます。リセットしたい場合はファイルを削除してから再度 `npm run db:push && npm run db:seed` を実行してください。

### 環境変数

```env
# Database (SQLite)
SQLITE_DB_PATH=./social-card-game.db

# Redis
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## 📊 データベーススキーマ

### 主要テーブル

- **players**: プレイヤー情報
- **card_masters**: カードマスターデータ
- **player_cards**: プレイヤー所有カード
- **decks**: デッキ情報
- **quests**: クエストデータ
- **quest_progress**: クエスト進行状況
- **gacha_banners**: ガチャバナー
- **gacha_history**: ガチャ履歴
- **friends**: フレンド関係
- **friend_requests**: フレンド申請
- **rankings**: ランキング
- **battles**: バトル情報（実装予定）

## 🎯 API エンドポイント

### 認証
- `POST /api/auth/register` - 新規登録
- `POST /api/auth/login` - ログイン

### プレイヤー
- `GET /api/player/profile` - プロフィール取得
- `PUT /api/player/profile` - プロフィール更新
- `POST /api/player/stamina/recover` - スタミナ回復
- `GET /api/player/daily-login` - デイリーログイン確認
- `POST /api/player/daily-login/claim` - デイリーログイン受取

### カード
- `GET /api/cards/master` - カードマスターデータ取得
- `GET /api/cards/collection` - カードコレクション取得
- `POST /api/cards/enhance` - カード強化

### デッキ
- `GET /api/decks` - デッキ一覧取得
- `POST /api/decks` - デッキ作成
- `GET /api/decks/:deckId` - デッキ詳細取得
- `PUT /api/decks/:deckId` - デッキ更新
- `DELETE /api/decks/:deckId` - デッキ削除

### ガチャ
- `GET /api/gacha/banners` - ガチャバナー一覧
- `POST /api/gacha/pull` - ガチャ実行
- `GET /api/gacha/history` - ガチャ履歴

### クエスト
- `GET /api/quests` - クエスト一覧
- `GET /api/quests/:questId` - クエスト詳細
- `POST /api/quests/:questId/start` - クエスト開始
- `POST /api/quests/:questId/complete` - クエスト完了

### ソーシャル
- `GET /api/social/friends` - フレンド一覧
- `POST /api/social/friends/request` - フレンド申請
- `POST /api/social/friends/accept` - フレンド承認
- `DELETE /api/social/friends/:friendId` - フレンド削除
- `GET /api/social/ranking` - ランキング取得

## 🎴 カードシステム

### 属性（6種類）
- 🔥 火 (Fire)
- 💧 水 (Water)
- 🌿 地 (Earth)
- 💨 風 (Wind)
- ⭐ 光 (Light)
- 🌑 闇 (Dark)

### レアリティ（4種類）
- Common (コモン) - 70%
- Rare (レア) - 20%
- Super Rare (スーパーレア) - 8%
- Ultra Rare (ウルトラレア) - 2%

## 🎮 ゲームバランス

- **初期リソース**: ゴールド 10,000、ジェム 500、スタミナ 100
- **スタミナ回復**: 5分で1ポイント
- **デッキサイズ**: 20〜40枚
- **カード重複**: 同一カード最大3枚
- **デッキコスト上限**: 200
- **フレンド上限**: 50人

## 📝 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Lint
npm run lint

# データベース操作
npm run db:generate    # マイグレーション生成
npm run db:migrate     # マイグレーション実行
npm run db:push        # スキーマプッシュ
npm run db:studio      # Drizzle Studio起動
npm run db:seed        # シードデータ投入

# E2Eテスト (Playwright)
npx playwright install            # ブラウザのセットアップ（初回のみ）
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run dev # 既存サーバーを使いたい場合
npm run test:e2e                  # E2Eテストの実行
```

## 🧪 E2Eテスト手順

1. **データベースを準備**: `npm run db:push && npm run db:seed` で開発用ユーザー（dev@test.com / dev123）を投入します。
2. **Playwrightのブラウザを取得**: 初回のみ `npx playwright install` を実行します。
3. **テスト実行**: `npm run test:e2e` でテストを起動します（Next.js開発サーバーはPlaywrightが自動起動します）。

環境をカスタマイズしたい場合は下記の環境変数を利用できます:

- `PLAYWRIGHT_BASE_URL`: 既存の起動中サーバーへ接続したい場合にベースURLを上書き
- `PLAYWRIGHT_WEB_SERVER_COMMAND`: サーバー起動コマンドを差し替え
- `PLAYWRIGHT_SKIP_WEBSERVER=1`: すでに立ち上げたサーバーを流用

サーバーを自前で立ち上げる場合は `NEXTAUTH_URL` や `SQLITE_DB_PATH` など `.env` に定義した値を忘れずに読み込んでください。

> ℹ️ E2E テストは実際の SQLite ファイルを更新します（DEV_USER のゴールドやカードが増減します）。毎回クリーンな状態で検証したい場合はテスト前後に `npm run db:push && npm run db:seed` を実行してリセットしてください。

## 🎨 デザインリソース

プロジェクトには以下のデザイン依頼書が含まれています：

- `DESIGN_BRIEF.md` - カードイラスト・UIアイコン依頼書
- `LOBABLE_PROMPT.md` - Lobable投稿用プロンプト
- `UI_DESIGN_BRIEF.md` - Webサイト全体のUIデザイン依頼書

## 📖 今後の実装予定

- [ ] バトルシステム（ターン制カードバトル）
- [ ] Web通知システム
- [ ] フロントエンドUI実装
- [ ] PWA対応
- [ ] リアルタイムPvP
- [ ] ギルド/クランシステム
- [ ] イベントシステム
- [ ] アチーブメントシステム

## 📄 ライセンス

このプロジェクトは私的利用目的で作成されています。

## 👤 作成者

Social Card Game Development Team
