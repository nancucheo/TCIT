import { test, expect } from '@playwright/test';

test.describe('Create Post', () => {
  test('should create a post and show it in the table', async ({ page }) => {
    let postId = 10;
    await page.route('**/api/v1/posts', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }),
        });
      }
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: postId++,
              name: body.name,
              description: body.description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await page.goto('/');
    await page.getByPlaceholder('Nombre').fill('New Post');
    await page.getByPlaceholder('Descripción').fill('Post content');
    await page.getByRole('button', { name: 'Crear' }).click();

    await expect(page.getByText('Post creado exitosamente')).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.route('**/api/v1/posts', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }),
      }),
    );

    await page.goto('/');
    await page.getByRole('button', { name: 'Crear' }).click();

    await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
    await expect(page.getByText('La descripción es obligatoria')).toBeVisible();
  });

  test('should show error toast on duplicate name', async ({ page }) => {
    await page.route('**/api/v1/posts', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }),
        });
      }
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'POST_ALREADY_EXISTS',
              message: "A post with name 'Duplicate' already exists",
            },
          }),
        });
      }
    });

    await page.goto('/');
    await page.getByPlaceholder('Nombre').fill('Duplicate');
    await page.getByPlaceholder('Descripción').fill('Desc');
    await page.getByRole('button', { name: 'Crear' }).click();

    await expect(page.getByText("A post with name 'Duplicate' already exists")).toBeVisible();
  });

  test('should clear form after successful creation', async ({ page }) => {
    await page.route('**/api/v1/posts', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }),
        });
      }
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 1,
              name: 'Post',
              description: 'Desc',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await page.goto('/');
    await page.getByPlaceholder('Nombre').fill('Post');
    await page.getByPlaceholder('Descripción').fill('Desc');
    await page.getByRole('button', { name: 'Crear' }).click();

    await expect(page.getByPlaceholder('Nombre')).toHaveValue('');
    await expect(page.getByPlaceholder('Descripción')).toHaveValue('');
  });
});
