import { expect, type Page } from '@playwright/test';

export async function loginAsDev(page: Page) {
  if (!page.url().includes('/login')) {
    await page.goto('/login');
  }

  await expect(
    page.getByRole('heading', { name: 'Social Card Game' })
  ).toBeVisible();

  const devLoginButton = page.getByRole('button', {
    name: /開発用ログイン/,
  });

  await expect(devLoginButton).toBeEnabled();
  await devLoginButton.click();

  await page.waitForURL('**/home', { timeout: 15_000 });
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.locator('h1')).toContainText('ようこそ');
}
