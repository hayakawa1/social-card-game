import { test, expect } from '@playwright/test';
import { loginAsDev } from './utils/auth';

test.describe('Dev login flow', () => {
  test('redirects root to login and completes the dev login flow', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForURL('**/login');

    await expect(page.getByText('Social Card Game')).toBeVisible();

    await loginAsDev(page);

    await expect(page.locator('h1')).toContainText('ようこそ');
    await expect(
      page.getByRole('link', { name: /カードコレクション/ })
    ).toBeVisible();
  });

  test('navigates to the cards collection and allows filtering', async ({
    page,
  }) => {
    await loginAsDev(page);

    await page.getByRole('link', { name: /カードコレクション/ }).click();
    await page.waitForURL('**/cards');

    await expect(
      page.getByRole('heading', { name: 'カードコレクション' })
    ).toBeVisible();

    const raritySelect = page.locator('select').first();
    const attributeSelect = page.locator('select').nth(1);

    await raritySelect.selectOption('rare');
    await attributeSelect.selectOption('fire');

    await expect(raritySelect).toHaveValue('rare');
    await expect(attributeSelect).toHaveValue('fire');

    await page.getByRole('link', { name: '← ホームに戻る' }).click();
    await page.waitForURL('**/home');

    await expect(page.locator('h1')).toContainText('ようこそ');
  });
});
