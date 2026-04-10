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

test.describe('Delete Post', () => {
  test('should remove post from table after delete', async ({ page }) => {
    let posts = [...mockPosts];

    await page.route('**/api/v1/posts', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: posts, meta: { total: posts.length } }),
      });
    });

    await page.route('**/api/v1/posts/*', (route) => {
      if (route.request().method() === 'DELETE') {
        const url = route.request().url();
        const id = Number(url.split('/').pop());
        const deleted = posts.find((p) => p.id === id);
        posts = posts.filter((p) => p.id !== id);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: deleted }),
        });
      }
    });

    await page.goto('/');
    await expect(page.locator('tbody tr')).toHaveCount(2);

    await page.getByRole('button', { name: 'Delete' }).first().click();

    await expect(page.getByText('Post deleted successfully')).toBeVisible();
  });

  test('should show success toast after deletion', async ({ page }) => {
    await page.route('**/api/v1/posts', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockPosts, meta: { total: 2 } }),
      });
    });

    await page.route('**/api/v1/posts/*', (route) => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockPosts[0] }),
        });
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Delete' }).first().click();

    await expect(page.getByText('Post deleted successfully')).toBeVisible();
  });

  test('should decrease row count after deletion', async ({ page }) => {
    let posts = [...mockPosts];

    await page.route('**/api/v1/posts', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: posts, meta: { total: posts.length } }),
      });
    });

    await page.route('**/api/v1/posts/*', (route) => {
      if (route.request().method() === 'DELETE') {
        const deleted = posts[0];
        posts = posts.slice(1);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: deleted }),
        });
      }
    });

    await page.goto('/');
    await expect(page.locator('tbody tr')).toHaveCount(2);

    await page.getByRole('button', { name: 'Delete' }).first().click();

    // Wait for refetch with updated data
    await expect(page.getByText('Post deleted successfully')).toBeVisible();
  });
});
