import { test, expect } from '@playwright/test';

test('Verify that the page renders properly', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  const res = await page.evaluate(async () => {
    const pageContent = document.body.innerText;
    return pageContent.includes('Component');
  });
  expect(res).toBe(true);
});
