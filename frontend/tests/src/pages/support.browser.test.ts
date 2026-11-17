import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const openDemo = async (page: import('@playwright/test').Page) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Try the demo' }).click();
  await expect(
    page.getByRole('heading', { name: 'Customer requests' }),
  ).toBeVisible();
};

test('demo: route to a request, verify its source, edit, approve and reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await openDemo(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/tickets?')) requests.push(request.url());
  });
  await page
    .getByRole('button', { name: 'Load more' })
    .scrollIntoViewIfNeeded();
  await expect
    .poll(() => requests.some((url) => url.includes('cursor=')))
    .toBe(true);
  await expect(page.getByText('18 loaded', { exact: true })).toBeVisible();
  await page
    .getByRole('link', {
      name: 'Open request: My sign-in link expired before the meeting',
    })
    .click();
  await expect(page).toHaveURL(/\/tickets\/[\da-f-]+$/);
  await page.route('**/api/runs/*/events?*', (route) => route.abort('failed'));
  await page
    .getByRole('button', { name: 'Prepare reply', exact: true })
    .first()
    .click();
  await expect(
    page.getByText('Ready for your review', { exact: true }),
  ).toBeVisible();
  const quote = await page
    .getByLabel('Source evidence')
    .locator('[data-slot=card-content] p')
    .first()
    .innerText();
  const cite = page.getByRole('button', { name: 'Open citation 1' });
  await cite.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').locator('blockquote')).toHaveText(
    quote.slice(1, -1),
  );
  await page.keyboard.press('Escape');
  await expect(cite).toBeFocused();
  const draft = page.getByLabel('Reply to the customer');
  await draft.fill(
    (await draft.inputValue()) + ' Thank you for your patience.',
  );
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
  const approved = page
    .getByRole('region', { name: 'Reply preparation' })
    .getByText('Reply approved and saved', { exact: true });
  await expect(approved).toBeVisible();
  await expect(draft).toHaveAttribute('readonly', '');
  await page.reload();
  await expect(approved).toBeVisible();
  expect(await draft.inputValue()).toContain('Thank you for your patience.');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: 'test-results/support-approved-desktop.png',
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Resolved', exact: true }).click();
  await expect(page.getByText('1 loaded', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'Open request: My sign-in link expired before the meeting',
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('button', { name: 'Try the demo' }),
  ).toBeVisible();
});

test('history uses cursor pagination and each saved preparation can be reopened', async ({
  page,
}) => {
  await openDemo(page);
  await page
    .getByRole('link', {
      name: 'Open request: My sign-in link expired before the meeting',
    })
    .click();
  const token = await page.evaluate(
    () =>
      JSON.parse(sessionStorage.getItem('support-desk-session-v2')!)
        .token as string,
  );
  const ticketId = new URL(page.url()).pathname.split('/').at(-1);
  const headers = { authorization: `Bearer ${token}` };
  for (let index = 0; index < 7; index++) {
    const response = await page.request.post(`/api/tickets/${ticketId}/runs`, {
      headers,
      data: {},
    });
    expect(response.status()).toBe(201);
    const run = (await response.json()) as { id: string };
    await expect
      .poll(
        async () =>
          (
            await (
              await page.request.get(`/api/runs/${run.id}`, { headers })
            ).json()
          ).status,
      )
      .toBe('ready');
  }
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/history?')) requests.push(request.url());
  });
  await page.reload();
  const history = page.getByRole('region', { name: 'Ticket history' });
  await history
    .getByRole('button', { name: 'Load more' })
    .scrollIntoViewIfNeeded();
  await expect
    .poll(() => requests.some((url) => url.includes('cursor=')))
    .toBe(true);
  await expect(history.locator('[data-slot=card]')).toHaveCount(7);
  await history
    .getByRole('button', { name: 'Open saved preparation' })
    .last()
    .click();
  await expect(page.getByLabel('Reply to the customer')).toBeVisible();
});

test('missing policy, mobile navigation and offline recovery', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDemo(page);
  await page
    .getByRole('link', { name: /Open request:.*retention/i })
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
  await page.screenshot({
    path: 'test-results/support-mobile.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(
    page.getByRole('button', { name: 'Try the demo' }),
  ).toBeVisible();
});

test('account sign-in restores its workspace and deep links require authentication', async ({
  page,
}) => {
  await page.goto('/tickets/00000000-0000-0000-0000-000000000000');
  await expect(page).toHaveURL('/login');
  await page.getByRole('link', { name: 'Create account', exact: true }).click();
  const email = `browser-${crypto.randomUUID()}@example.test`;
  const password = 'Synthetic-only-password-8492';
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Inbox', exact: true }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Customer requests' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
});
