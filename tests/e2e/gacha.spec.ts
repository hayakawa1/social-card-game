import { test, expect, type Page } from '@playwright/test';
import { loginAsDev } from './utils/auth';

async function navigateToGacha(page: Page) {
  await loginAsDev(page);
  await page.getByRole('link', { name: /ガチャ/ }).click();
  await page.waitForURL('**/gacha');
  await expect(
    page.getByRole('heading', { name: /ガチャ$/, level: 1 })
  ).toBeVisible({ timeout: 10_000 });
}

test.describe('Gacha experience', () => {
  test('performs a single gold pull and returns to banner selection', async ({
    page,
  }) => {
    await navigateToGacha(page);

    const singleGoldSection = page
      .getByRole('heading', { level: 3, name: '単発ガチャ（ゴールド）' })
      .locator('..');

    await singleGoldSection
      .getByRole('button', { name: '1回引く' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'ガチャ結果' })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(/枚のカードを獲得しました/)
    ).toContainText('1枚');

    await page.getByRole('button', { name: 'もう一度引く' }).click();
    await expect(
      page.getByRole('heading', { name: /ガチャ$/, level: 1 })
    ).toBeVisible({ timeout: 10_000 });
  });
});
