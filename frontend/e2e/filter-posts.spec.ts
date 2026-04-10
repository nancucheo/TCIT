import { test, expect } from '@playwright/test';

const mockPosts = [
  { id: 1, name: 'TypeScript Tips', description: 'TS advice', createdAt: '2026-04-10T10:00:00.000Z', updatedAt: '2026-04-10T10:00:00.000Z' },
  { id: 2, name: 'React Hooks', description: 'Hook patterns', createdAt: '2026-04-10T11:00:00.000Z', updatedAt: '2026-04-10T11:00:00.000Z' },
  { id: 3, name: 'Node.js Guide', description: 'Backend tips', createdAt: '2026-04-10T12:00:00.000Z', updatedAt: '2026-04-10T12:00:00.000Z' },
];

test.describe('Filter Posts', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/posts', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockPosts, meta: { total: 3 } }),
        });
      }
      return route.continue();
    });
  });

  test('should filter posts by name', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Filtrar por nombre').fill('TypeScript');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('TypeScript Tips')).toBeVisible();
    await expect(page.getByText('React Hooks')).not.toBeVisible();
    await expect(page.getByText('Node.js Guide')).not.toBeVisible();
  });

  test('should filter case-insensitively', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Filtrar por nombre').fill('typescript');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('TypeScript Tips')).toBeVisible();
  });

  test('should show all posts when filter is cleared', async ({ page }) => {
    await page.goto('/');

    // Apply filter
    await page.getByPlaceholder('Filtrar por nombre').fill('TypeScript');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByText('React Hooks')).not.toBeVisible();

    // Clear filter
    await page.getByPlaceholder('Filtrar por nombre').fill('');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('TypeScript Tips')).toBeVisible();
    await expect(page.getByText('React Hooks')).toBeVisible();
    await expect(page.getByText('Node.js Guide')).toBeVisible();
  });

  test('should show no results message when no posts match', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Filtrar por nombre').fill('xyz');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Ningún post coincide con tu filtro')).toBeVisible();
  });

  test('should filter on Enter key', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Filtrar por nombre').fill('React');
    await page.getByPlaceholder('Filtrar por nombre').press('Enter');

    await expect(page.getByText('React Hooks')).toBeVisible();
    await expect(page.getByText('TypeScript Tips')).not.toBeVisible();
  });
});
