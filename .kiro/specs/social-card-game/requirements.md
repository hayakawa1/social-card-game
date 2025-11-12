# 要件定義書

## はじめに

本文書は、PC向けソーシャルカードゲームの要件を定義します。プレイヤーはカードを収集し、デッキを構築し、他のプレイヤーと対戦します。ゲームはガチャシステム、スタミナ管理、フレンドシステムなど、一般的なソーシャルゲームの要素を含みます。

**技術スタック:**
- Next.js 16 + React 19 + TypeScript
- Drizzle ORM + SQLite (開発) / PostgreSQL (本番)
- NextAuth.js v5 + bcryptjs
- Tailwind CSS + shadcn/ui + Framer Motion

## 用語集

- **Game System**: カードゲームのコア機能を管理するシステム
- **Player**: ゲームをプレイするユーザー
- **Card**: ゲーム内で収集可能なデジタルカード
- **Deck**: プレイヤーが選択した最大40枚のカードの組み合わせ
- **Gacha System**: ランダムにカードを獲得できる抽選システム
- **Stamina**: プレイヤーのアクション実行に必要なリソース
- **Battle System**: プレイヤー間またはAI相手の対戦を管理するシステム
- **Friend System**: プレイヤー間の社交機能を管理するシステム
- **Currency**: ゲーム内通貨（無料通貨と有料通貨）
- **Quest**: プレイヤーが完了できるミッション
- **Rarity**: カードの希少度（Common、Rare、Super Rare、Ultra Rare）

## 要件

### 要件1: プレイヤー管理

**ユーザーストーリー:** プレイヤーとして、自分のアカウントを作成し、プロフィールを管理したい。そうすることで、ゲームの進行状況を保存し、他のプレイヤーと区別できるようにしたい。

#### 受入基準

1. WHEN プレイヤーが初回起動時にアカウント作成を要求する、THEN THE Game System SHALL プレイヤーの一意のIDとプロフィールを作成する
2. THE Game System SHALL プレイヤー名、レベル、経験値、所持通貨を保存する
3. WHEN プレイヤーがプロフィール編集を要求する、THEN THE Game System SHALL プレイヤー名とアイコンの変更を許可する
4. THE Game System SHALL プレイヤーのログイン履歴と最終ログイン時刻を記録する

### 要件2: カード管理

**ユーザーストーリー:** プレイヤーとして、様々なカードを収集し、管理したい。そうすることで、自分のコレクションを構築し、戦略的なデッキを作成できるようにしたい。

#### 受入基準

1. THE Game System SHALL 各カードに一意のID、名前、レアリティ、攻撃力、防御力、コスト、属性を持たせる
2. THE Game System SHALL プレイヤーが所有する全カードのリストを管理する
3. WHEN プレイヤーが同じカードを複数枚獲得する、THEN THE Game System SHALL 各カードインスタンスを個別に保存する
4. THE Game System SHALL カードのレベルアップと強化機能を提供する
5. WHEN プレイヤーがカードを強化する、THEN THE Game System SHALL 必要な素材と通貨を消費し、カードのステータスを向上させる

### 要件3: デッキ構築

**ユーザーストーリー:** プレイヤーとして、所有するカードから戦略的なデッキを構築したい。そうすることで、バトルで使用する最適な組み合わせを作成できるようにしたい。

#### 受入基準

1. THE Game System SHALL プレイヤーが最大5つのデッキを保存することを許可する
2. THE Game System SHALL 各デッキに20枚から40枚のカードを含めることを要求する
3. WHEN プレイヤーがデッキにカードを追加する、THEN THE Game System SHALL 同じカードを最大3枚まで含めることを許可する
4. THE Game System SHALL デッキの総コストが制限値を超えないことを検証する
5. WHEN プレイヤーがバトルを開始する、THEN THE Game System SHALL 有効なデッキが選択されていることを確認する

### 要件4: ガチャシステム

**ユーザーストーリー:** プレイヤーとして、通貨を使用してランダムにカードを獲得したい。そうすることで、コレクションを拡大し、レアカードを入手できるようにしたい。

#### 受入基準

1. THE Game System SHALL 単発ガチャと10連ガチャのオプションを提供する
2. WHEN プレイヤーがガチャを実行する、THEN THE Game System SHALL 設定された確率に基づいてランダムにカードを抽選する
3. THE Game System SHALL Common 70%、Rare 20%、Super Rare 8%、Ultra Rare 2%の基本確率を適用する
4. WHEN プレイヤーが10連ガチャを実行する、THEN THE Game System SHALL 少なくとも1枚のRare以上のカードを保証する
5. THE Game System SHALL ガチャ実行前に必要な通貨をプレイヤーが所持していることを確認する
6. WHEN ガチャが完了する、THEN THE Game System SHALL 獲得したカードをプレイヤーのコレクションに追加する

### 要件5: スタミナシステム

**ユーザーストーリー:** プレイヤーとして、スタミナを消費してクエストやバトルに参加したい。そうすることで、ゲームプレイのペースが管理され、時間経過で回復する仕組みを利用できるようにしたい。

#### 受入基準

1. THE Game System SHALL 各プレイヤーに最大スタミナ値を設定する
2. THE Game System SHALL スタミナを5分ごとに1ポイント自動回復させる
3. WHEN プレイヤーがクエストまたはバトルを開始する、THEN THE Game System SHALL 必要なスタミナを消費する
4. IF プレイヤーのスタミナが不足している、THEN THE Game System SHALL アクションの実行を拒否し、エラーメッセージを表示する
5. THE Game System SHALL プレイヤーがアイテムまたは有料通貨でスタミナを回復することを許可する

### 要件6: バトルシステム

**ユーザーストーリー:** プレイヤーとして、自分のデッキを使用してAIまたは他のプレイヤーと対戦したい。そうすることで、カードの戦略的な使用を楽しみ、報酬を獲得できるようにしたい。

#### 受入基準

1. WHEN プレイヤーがバトルを開始する、THEN THE Battle System SHALL 選択されたデッキからランダムに初期手札を配布する
2. THE Battle System SHALL ターン制のバトルフローを実装する
3. WHEN プレイヤーのターンが開始する、THEN THE Battle System SHALL カードを1枚ドローし、利用可能なコストを回復する
4. THE Battle System SHALL プレイヤーがコスト範囲内でカードをプレイすることを許可する
5. WHEN カードが場に出る、THEN THE Battle System SHALL カードの効果を適用し、攻撃または防御アクションを実行する
6. THE Battle System SHALL いずれかのプレイヤーのライフポイントが0になったときにバトルを終了する
7. WHEN バトルが終了する、THEN THE Battle System SHALL 勝者に経験値、通貨、カードなどの報酬を付与する

### 要件7: クエストシステム

**ユーザーストーリー:** プレイヤーとして、様々なクエストに挑戦したい。そうすることで、ストーリーを進行し、報酬を獲得できるようにしたい。

#### 受入基準

1. THE Game System SHALL 複数の難易度レベルのクエストを提供する
2. WHEN プレイヤーがクエストを選択する、THEN THE Game System SHALL 必要なスタミナとプレイヤーレベルを確認する
3. THE Game System SHALL クエストをAI対戦として実装する
4. WHEN プレイヤーがクエストをクリアする、THEN THE Game System SHALL 経験値、通貨、カード、素材を報酬として付与する
5. THE Game System SHALL 各クエストの初回クリア報酬を追加で付与する

### 要件8: フレンドシステム

**ユーザーストーリー:** プレイヤーとして、他のプレイヤーとフレンドになりたい。そうすることで、社交的な体験を楽しみ、フレンド限定の機能を利用できるようにしたい。

#### 受入基準

1. WHEN プレイヤーが他のプレイヤーにフレンド申請を送る、THEN THE Friend System SHALL 申請を相手のリストに追加する
2. WHEN プレイヤーがフレンド申請を承認する、THEN THE Friend System SHALL 両プレイヤーのフレンドリストに相手を追加する
3. THE Friend System SHALL プレイヤーが最大50人のフレンドを持つことを許可する
4. THE Game System SHALL フレンドのサポートカードをバトルで使用することを許可する
5. WHEN プレイヤーがフレンドのサポートカードを使用する、THEN THE Game System SHALL 両プレイヤーに友情ポイントを付与する

### 要件9: 通貨システム

**ユーザーストーリー:** プレイヤーとして、ゲーム内通貨を獲得し使用したい。そうすることで、ガチャ、アイテム購入、その他のゲーム機能にアクセスできるようにしたい。

#### 受入基準

1. THE Game System SHALL 無料通貨（ゴールド）と有料通貨（ジェム）の2種類を管理する
2. WHEN プレイヤーがクエストやバトルをクリアする、THEN THE Game System SHALL ゴールドを報酬として付与する
3. THE Game System SHALL プレイヤーが実際の通貨でジェムを購入することを許可する
4. THE Game System SHALL 各アクションに必要な通貨タイプと量を定義する
5. WHEN プレイヤーが通貨を使用する、THEN THE Game System SHALL 十分な残高があることを確認し、使用後に残高を更新する

### 要件10: デイリーログインボーナス

**ユーザーストーリー:** プレイヤーとして、毎日ログインすることで報酬を受け取りたい。そうすることで、継続的なプレイが奨励され、無料でリソースを獲得できるようにしたい。

#### 受入基準

1. WHEN プレイヤーが1日の初回ログインをする、THEN THE Game System SHALL ログインボーナスを付与する
2. THE Game System SHALL 連続ログイン日数を追跡する
3. THE Game System SHALL 連続ログイン日数に応じて報酬の価値を増加させる
4. WHEN プレイヤーが7日間連続でログインする、THEN THE Game System SHALL 特別報酬を付与し、カウンターをリセットする
5. IF プレイヤーが1日ログインしない、THEN THE Game System SHALL 連続ログインカウンターをリセットする

### 要件11: ランキングシステム

**ユーザーストーリー:** プレイヤーとして、他のプレイヤーと競い合い、ランキングで自分の順位を確認したい。そうすることで、競争的な目標を持ち、上位報酬を目指せるようにしたい。

#### 受入基準

1. THE Game System SHALL プレイヤーのPvPバトル勝利数に基づいてランキングポイントを計算する
2. WHEN プレイヤーがPvPバトルに勝利する、THEN THE Game System SHALL ランキングポイントを加算する
3. WHEN プレイヤーがPvPバトルに敗北する、THEN THE Game System SHALL ランキングポイントを減算する
4. THE Game System SHALL 全プレイヤーのランキングをリアルタイムで更新する
5. THE Game System SHALL 上位100位のプレイヤーリストを表示する
6. WHEN ランキングシーズンが終了する、THEN THE Game System SHALL 順位に応じた報酬を配布し、ポイントをリセットする

### 要件12: 通知システム

**ユーザーストーリー:** プレイヤーとして、重要なゲームイベントについて通知を受け取りたい。そうすることで、スタミナ回復、イベント開始、フレンド申請などを見逃さないようにしたい。

#### 受入基準

1. WHEN プレイヤーのスタミナが最大値に達する、THEN THE Game System SHALL プッシュ通知を送信する
2. WHEN プレイヤーがフレンド申請を受け取る、THEN THE Game System SHALL アプリ内通知を表示する
3. WHEN 期間限定イベントが開始する、THEN THE Game System SHALL プッシュ通知を送信する
4. THE Game System SHALL プレイヤーが通知設定をカスタマイズすることを許可する
5. THE Game System SHALL 未読の通知数をアプリアイコンのバッジに表示する
