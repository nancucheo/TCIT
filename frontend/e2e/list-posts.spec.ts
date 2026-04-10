import { test, expect } from '@playwright/test';

const mockPosts = [
  {
    id: 1,
    name: 'First Post',
    description: 'First description',
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-04-10T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Second Post',
    description: 'Second description',
    createdAt: '2026-04-10T11:00:00.000Z',
    updatedAt: '2026-04-10T11:00:00.000Z',
  },
];

test.describe('List Posts', () => {
  test('should display posts in a table', async ({ page }) => {
    await page.route('**/api/v1/posts', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockPosts,
          meta: { total: 2 },
        }),
      }),
    );

    await page.goto('/');

    await expect(page.getByText('First Post')).toBeVisible();
    await expect(page.getByText('Second Post')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(2);
  });

  test('should display the application title', async ({ page }) => {
    await page.route('**/api/v1/posts', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }),
      }),
    );

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'TCIT Posts Manager' })).toBeVisible();
  });

  test('should display correct table headers', async ({ page }) => {
    await page.route('**/api/v1/posts', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockPosts,
          meta: { total: 2 },
        }),
      }),
    );

    await page.goto('/');

    await expect(page.locator('th', { hasText: 'Nombre' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Descripción' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Acción' })).toBeVisible();
  });

  test('should display empty state when no posts exist', async ({ page }) => {
    await page.route('**/api/v1/posts', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }),
      }),
    );

    await page.goto('/');

    await expect(page.getByText('No se encontraron posts')).toBeVisible();
  });

  test('should display loading spinner initially', async ({ page }) => {
    await page.route('**/api/v1/posts', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }),
      });
    });

    await page.goto('/');

    await expect(page.locator('[role="status"]')).toBeVisible();
  });
});
