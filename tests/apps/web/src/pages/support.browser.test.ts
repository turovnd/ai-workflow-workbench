import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
test('real demo workspace: cite, edit, approve, reload and page the inbox', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Try the demo' }).click();
  await expect(
    page.getByRole('heading', { name: 'My sign-in link has expired' }),
  ).toBeVisible();
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/tickets?')) requests.push(request.url());
  });
  const list = page.getByRole('tabpanel', { name: 'All', exact: true });
  await list.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect
    .poll(() => requests.some((url) => url.includes('cursor=')))
    .toBe(true);
  await expect(page.getByText('24 loaded', { exact: true })).toBeVisible();
  await list.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(page.getByText('36 loaded', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Prepare reply', exact: true })
    .first()
    .click();
  await expect(
    page.getByText('Ready for your review', { exact: true }),
  ).toBeVisible();
  const expectedQuote = await page
    .getByLabel('Source evidence')
    .locator('[data-slot=card-content] p')
    .first()
    .innerText();
  const cite = page.getByRole('button', { name: 'Open citation 1' });
  await cite.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('blockquote')).toHaveText(
    expectedQuote.slice(1, -1),
  );
  await page.keyboard.press('Escape');
  await expect(cite).toBeFocused();
  const draft = page.getByLabel('Reply to the customer');
  await draft.fill(
    (await draft.inputValue()) + ' Thank you for your patience.',
  );
  await expect(page.getByText('Unsaved edits', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Review & approve' }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Save edits', exact: true }).click();
  await expect(page.getByText('Edited by you', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Review & approve' }).click();
  await expect(
    page.getByRole('dialog').getByText(/Thank you for your patience/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm approval' }).click();
  await expect(
    page
      .getByRole('region', { name: 'Reply preparation' })
      .getByText('Reply approved and saved', { exact: true }),
  ).toBeVisible();
  await expect(draft).toHaveAttribute('readonly', '');
  await page.reload();
  await expect(
    page
      .getByRole('region', { name: 'Reply preparation' })
      .getByText('Reply approved and saved', { exact: true }),
  ).toBeVisible();
  expect(await draft.inputValue()).toContain('Thank you for your patience.');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: 'test-results/support-approved-desktop.png',
    fullPage: true,
  });
  const token = await page.evaluate(
    () =>
      JSON.parse(sessionStorage.getItem('support-desk-session-v2')!)
        .token as string,
  );
  const ticketId = new URL(page.url()).searchParams.get('ticket');
  for (let index = 0; index < 6; index++) {
    const response = await page.request.post(`/api/tickets/${ticketId}/runs`, {
      headers: { authorization: `Bearer ${token}` },
      data: {},
    });
    expect(response.status()).toBe(201);
  }
  const historyRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/history?'))
      historyRequests.push(request.url());
  });
  await page.reload();
  await expect(
    page
      .getByRole('region', { name: 'Ticket history' })
      .locator('[data-slot=card]'),
  ).toHaveCount(6);
  await page.getByRole('main').evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect
    .poll(() => historyRequests.some((url) => url.includes('cursor=')))
    .toBe(true);
  await expect(
    page
      .getByRole('region', { name: 'Ticket history' })
      .locator('[data-slot=card]'),
  ).toHaveCount(8);
  await page.getByRole('tab', { name: 'Resolved', exact: true }).click();
  await expect(page.getByText('1 loaded', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('button', { name: 'Try the demo' }),
  ).toBeVisible();
});
test('missing policy asks for clarification; mobile and offline states are usable', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Try the demo' }).click();
  await expect(
    page.getByRole('heading', { name: 'My sign-in link has expired' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Toggle inbox' }).click();
  await page
    .getByRole('button', { name: /Can you promise two years of retention/ })
    .first()
    .click();
  await page
    .getByRole('button', { name: 'Prepare reply', exact: true })
    .first()
    .click();
  await expect(
    page.getByText('Clarification needed', { exact: true }),
  ).toBeVisible();
  expect(await page.getByLabel('Reply to the customer').inputValue()).toContain(
    'Could you share',
  );
  await page.getByRole('radio', { name: 'Reply + escalation' }).click();
  await page.getByRole('button', { name: 'Review & approve' }).click();
  await page.getByRole('button', { name: 'Confirm approval' }).click();
  await expect(
    page
      .getByRole('region', { name: 'Reply preparation' })
      .getByText('Reply approved and saved', { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.setOffline(true);
  await expect(
    page.getByText('You are offline', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Prepare another reply' }),
  ).toBeDisabled();
  await context.setOffline(false);
  await expect(
    page.getByRole('button', { name: 'Prepare another reply' }),
  ).toBeEnabled();
  await page.getByRole('main').evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.screenshot({
    path: 'test-results/support-mobile.png',
    fullPage: true,
  });
});
test('independent account signs in again and prevents parallel auth attempts', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Create account' }).click();
  const email = `browser-${crypto.randomUUID()}@example.test`;
  const password = 'Synthetic-only-password-8492';
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  let release!: () => void;
  const deferred = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/auth/register', async (route) => {
    await deferred;
    await route.continue();
  });
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.getByRole('tab', { name: 'Sign in' })).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Try the demo' }),
  ).toBeDisabled();
  release();
  await expect(
    page.getByText('Personal workspace', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByText('Personal workspace', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'My sign-in link has expired' }),
  ).toBeVisible();
});
