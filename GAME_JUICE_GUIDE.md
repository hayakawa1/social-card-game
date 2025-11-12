# ゲーム汁（Game Juice）実装ガイド

このプロジェクトに実装された「ゲーム感」を高めるための機能と使い方をまとめました。

## 📦 実装済みの機能

### 1. 🔊 音響システム（AudioManager）

BGMとSE（効果音）を管理するシステムです。

**場所**: `lib/audio/AudioManager.ts`

**使い方**:

```tsx
import { useAudio, useSoundEffect } from '@/hooks/useAudio';

function MyComponent() {
  const { playBgm, playSe } = useAudio();

  // BGMを再生
  playBgm('/sounds/bgm-main.mp3', true); // ループ再生

  // SEを再生
  playSe('/sounds/button-click.mp3');
}

// または、SEのみ使う場合
function MyButton() {
  const playSe = useSoundEffect();

  return (
    <button onClick={() => playSe('/sounds/click.mp3')}>
      クリック
    </button>
  );
}
```

**特徴**:
- BGM/SEの個別ミュート制御
- 音量調整
- LocalStorageに設定を保存
- 同時SE再生対応

---

### 2. 🎵 サウンドトグルボタン

画面右上に表示される音のON/OFFボタン

**場所**: `components/ui/SoundToggle.tsx`

**使い方**: `app/layout.tsx` に既に配置済み。自動的に全ページに表示されます。

---

### 3. 🎨 ゲームボタンコンポーネント

プレス時のアニメーションとSE再生機能付きボタン

**場所**: `components/ui/GameButton.tsx`

**使い方**:

```tsx
import { GameButton } from '@/components/ui/GameButton';

<GameButton
  variant="primary"  // primary, secondary, success, danger, warning
  size="lg"          // sm, md, lg
  onClick={handleClick}
>
  決定
</GameButton>
```

**特徴**:
- ホバー時に拡大（scale: 1.05）
- クリック時に縮小（scale: 0.95）
- 5種類のカラーバリエーション
- SE再生（soundEnabled={false}で無効化可能）

---

### 4. 🃏 ゲームカードコンポーネント

ホバー時の3Dチルト効果とレアリティ別グロー

**場所**: `components/ui/GameCard.tsx`

**使い方**:

```tsx
import { GameCard } from '@/components/ui/GameCard';

<GameCard
  rarity="ultra_rare"  // common, rare, super_rare, ultra_rare
  hoverable={true}
  glowEffect={true}
  onClick={handleClick}
>
  <img src="/cards/card001.png" />
  <div>カード名</div>
</GameCard>
```

**レアリティ別色**:
- **Common**: グレー
- **Rare**: ブルー
- **Super Rare**: パープル
- **Ultra Rare**: ゴールド

---

### 5. 💥 フローティング数値

ダメージや獲得ポイントを浮かび上がらせて表示

**場所**: `components/ui/FloatingNumber.tsx`

**使い方**:

```tsx
import { FloatingNumber } from '@/components/ui/FloatingNumber';

<FloatingNumber
  value={1234}
  x={100}
  y={200}
  color="#ff0000"
  critical={true}  // クリティカル表示
  onComplete={() => console.log('animation complete')}
/>
```

**複数管理の場合**:

```tsx
import { FloatingNumberContainer } from '@/components/ui/FloatingNumber';

const [numbers, setNumbers] = useState([
  { id: '1', value: 100, x: 50, y: 50, color: '#ff0000' },
  { id: '2', value: 200, x: 100, y: 100, color: '#00ff00', critical: true },
]);

<FloatingNumberContainer
  numbers={numbers}
  onNumberComplete={(id) => {
    // アニメーション完了時の処理
  }}
/>
```

---

### 6. 📈 パララックス背景

スクロールで動く2層背景

**場所**: `components/ui/ParallaxBackground.tsx`

**使い方**:

```tsx
import { ParallaxBackground } from '@/components/ui/ParallaxBackground';

<ParallaxBackground
  layer1Color="from-purple-900 via-blue-900 to-indigo-900"
  layer2Color="from-purple-800/50 via-blue-800/50 to-indigo-800/50"
  showStars={true}
>
  <YourContent />
</ParallaxBackground>
```

**シンプル版**:

```tsx
import { AnimatedBackground } from '@/components/ui/ParallaxBackground';

<AnimatedBackground className="your-class">
  <YourContent />
</AnimatedBackground>
```

---

### 7. 💫 スクリーンシェイク

画面を揺らす効果（被ダメージ演出など）

**場所**: `hooks/useScreenShake.ts`

**使い方**:

```tsx
import { useScreenShake } from '@/hooks/useScreenShake';

function BattleScene() {
  const { shake, shakeStyle } = useScreenShake();

  const takeDamage = () => {
    shake(120, 15); // duration: 120ms, amplitude: 15px
  };

  return (
    <div style={shakeStyle}>
      <button onClick={takeDamage}>ダメージ</button>
    </div>
  );
}
```

**推奨値**:
- 小ダメージ: `shake(80, 5)`
- 中ダメージ: `shake(120, 12)`
- 大ダメージ: `shake(160, 20)`

---

### 8. 🌈 ページ遷移アニメーション

フェード効果付きページ遷移

**場所**: `components/ui/PageTransition.tsx`

**使い方**: 各ページをラップする

```tsx
import { PageTransition } from '@/components/ui/PageTransition';

export default function MyPage() {
  return (
    <PageTransition>
      <YourContent />
    </PageTransition>
  );
}
```

---

## 🎵 サウンドファイルの準備

### 推奨ディレクトリ構造

```
public/
  sounds/
    bgm/
      main-menu.mp3
      battle.mp3
      gacha.mp3
    se/
      button-click.mp3
      button-cancel.mp3
      card-flip.mp3
      gacha-pull.mp3
      win.mp3
      lose.mp3
      damage-small.mp3
      damage-large.mp3
      heal.mp3
      level-up.mp3
```

### 推奨フォーマット

- **BGM**: MP3, 128-192kbps, ループ可能に編集
- **SE**: MP3 または WAV, 短い（0.1〜2秒）
- **ファイルサイズ**: BGMは3MB以下、SEは100KB以下を推奨

### フリー素材サイト

- **効果音**: [効果音ラボ](https://soundeffect-lab.info/)
- **BGM**: [DOVA-SYNDROME](https://dova-s.jp/)
- **魔王魂**: [https://maou.audio/](https://maou.audio/)

---

## 🎮 実装例：バトルシーン

```tsx
'use client';

import { useState } from 'react';
import { GameButton } from '@/components/ui/GameButton';
import { FloatingNumber } from '@/components/ui/FloatingNumber';
import { useScreenShake } from '@/hooks/useScreenShake';
import { useSoundEffect } from '@/hooks/useAudio';
import { ParallaxBackground } from '@/components/ui/ParallaxBackground';

export default function BattleScene() {
  const { shake, shakeStyle } = useScreenShake();
  const playSe = useSoundEffect();
  const [floatingNumbers, setFloatingNumbers] = useState<any[]>([]);

  const attack = () => {
    const damage = Math.floor(Math.random() * 100) + 50;
    const critical = Math.random() > 0.8;

    // SE再生
    playSe(critical ? '/sounds/se/damage-large.mp3' : '/sounds/se/damage-small.mp3');

    // 画面シェイク
    shake(critical ? 160 : 120, critical ? 20 : 12);

    // ダメージ数値表示
    setFloatingNumbers(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        value: damage,
        x: 300,
        y: 200,
        color: critical ? '#ff0000' : '#ffffff',
        critical,
      }
    ]);
  };

  return (
    <ParallaxBackground>
      <div style={shakeStyle} className="min-h-screen flex items-center justify-center">
        <div className="relative">
          {floatingNumbers.map(num => (
            <FloatingNumber
              key={num.id}
              {...num}
              onComplete={() => {
                setFloatingNumbers(prev => prev.filter(n => n.id !== num.id));
              }}
            />
          ))}

          <GameButton variant="danger" size="lg" onClick={attack}>
            攻撃！
          </GameButton>
        </div>
      </div>
    </ParallaxBackground>
  );
}
```

---

## 🎨 Tailwind カスタムクラス

### グローバルアニメーション（既に追加済み）

- `animate-gradient` - 背景グラデーションアニメーション
- `shake` - 画面シェイク（CSS変数 `--shake-intensity` で強度調整）

---

## ⚙️ カスタマイズ

### AudioManagerの設定変更

`lib/audio/AudioManager.ts` の初期設定:

```typescript
private config: AudioConfig = {
  bgmVolume: 0.6,  // BGM音量（0.0〜1.0）
  seVolume: 0.9,   // SE音量（0.0〜1.0）
  isBgmMuted: false,
  isSeMuted: false,
};
```

### ボタンのカラー追加

`components/ui/GameButton.tsx` の `variantClasses` を編集:

```typescript
const variantClasses = {
  // ...既存
  custom: 'bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700',
};
```

---

## 📝 次のステップ

1. **サウンドファイルの配置**: `public/sounds/` に実際の音源を配置
2. **BGMの自動再生**: 各ページで `useEffect` を使ってBGMを再生
3. **パーティクルエフェクト**: カード獲得時のキラキラ演出を追加
4. **トランジションの拡充**: より複雑なページ遷移を実装

---

## 🐛 トラブルシューティング

### 音が鳴らない

1. ブラウザの自動再生ポリシーにより、ユーザーインタラクション前は音が鳴りません
2. `AudioManager.init()` がユーザーのクリック後に呼ばれているか確認
3. ブラウザのコンソールでエラーを確認

### アニメーションがカクつく

1. Framer Motionの `transition` 設定を調整
2. `will-change: transform` を追加
3. 画像を最適化

### パララックスが動かない

1. ページに十分なスクロール可能な高さがあるか確認
2. `overflow: hidden` が親要素にかかっていないか確認

---

## 📚 参考資料

- [Framer Motion ドキュメント](https://www.framer.com/motion/)
- [Tailwind CSS アニメーション](https://tailwindcss.com/docs/animation)
- [Web Audio API](https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API)

---

以上で、ゲーム感を高める基本的な「汁」の実装が完了しています！🎮✨
