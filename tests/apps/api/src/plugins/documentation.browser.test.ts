import { expect, test } from '@playwright/test';

test('Swagger renders all operations with local assets and no external validator', async ({
  page,
}) => {
  const api = process.env.E2E_API_URL ?? 'http://127.0.0.1:4010';
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${api}/docs/`);
  await expect(page.locator('.swagger-ui .info .title')).toContainText(
    'Support Desk API',
  );
  await expect(page.locator('.opblock')).toHaveCount(17);
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
  expect(
    requests
      .filter((url) => /^https?:/.test(url))
      .every((url) => new URL(url).origin === new URL(api).origin),
  ).toBe(true);
  await expect(
    page.getByRole('button', { name: 'Authorize', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/support-swagger-desktop.png',
    fullPage: false,
  });
});
