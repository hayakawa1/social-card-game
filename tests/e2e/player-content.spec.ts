import { test, expect } from '@playwright/test';
import { loginAsDev } from './utils/auth';

test.describe('Player content pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDev(page);
  });

  test('shows the empty decks state with creation prompts', async ({ page }) => {
    await page.getByRole('link', { name: /デッキ編成/ }).click();
    await page.waitForURL('**/decks');

    await expect(
      page.getByRole('heading', { name: 'デッキ編成' })
    ).toBeVisible();
    await expect(page.getByText('デッキがありません')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /\+ 新しいデッキを作成/ })
    ).toBeVisible();
  });

  test('lists quests with their difficulty badges and CTA', async ({ page }) => {
    await page.getByRole('link', { name: /クエスト/ }).click();
    await page.waitForURL('**/quests');

    await expect(page.getByRole('heading', { name: 'クエスト' })).toBeVisible();
    await expect(page.getByText('Beginner Training')).toBeVisible();
    await expect(page.getByText('Forest Battle')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /(挑戦する|再挑戦)/ }).first()
    ).toBeVisible();
  });

  test('manages friend hubs with tabs and search', async ({ page }) => {
    await page.getByRole('link', { name: /フレンド/ }).click();
    await page.waitForURL('**/friends');

    await expect(page.getByRole('heading', { name: 'フレンド' })).toBeVisible();
    await expect(page.getByText('フレンドがいません')).toBeVisible();

    await page.getByRole('button', { name: 'リクエスト' }).click();
    await expect(page.getByText('受信したリクエストはありません')).toBeVisible();
    await expect(page.getByText('送信したリクエストはありません')).toBeVisible();

    await page.getByRole('button', { name: 'ユーザー検索' }).click();
    const searchInput = page.getByPlaceholder('ユーザー名を入力（2文字以上）');
    await searchInput.fill('te');

    const searchResult = page.getByText('testuser');
    await expect(searchResult).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('button', { name: 'リクエスト送信' })
    ).toBeVisible();
  });

  test('shows rankings and toggles between categories', async ({ page }) => {
    await page.getByRole('link', { name: /ランキング/ }).click();
    await page.waitForURL('**/ranking');

    await expect(
      page.getByRole('heading', { name: /ランキング/ })
    ).toBeVisible();
    await expect(page.getByText('AI_OPPONENT')).toBeVisible();

    const rankingButtons = [
      { label: '⭐ レベル', expectLabel: 'レベル' },
      { label: '💪 総戦闘力', expectLabel: '総戦闘力' },
      { label: '⚔️ 勝利数', expectLabel: '勝利数' },
      { label: '📊 勝率', expectLabel: '勝率' },
    ];

    for (const { label, expectLabel } of rankingButtons) {
      const button = page.getByRole('button', { name: label });
      await button.click();
      await expect(button).toHaveClass(/scale-110/, { timeout: 5_000 });
      const valueLabel = page
        .locator(
          'div.text-right.bg-white\\/20.backdrop-blur.rounded-xl.p-4.border-2.border-white\\/50 >> div.text-sm'
        )
        .first();
      await expect(valueLabel).toHaveText(expectLabel);
    }
  });
});
