import { test, expect } from '@playwright/test';

// Mock Data
const MOCK_LISTS = {
  items: [
    {
      id: 1,
      name: 'Work Projects',
      todos: [
        { id: 101, value: 'Finish Q1 Report', isCompleted: false, order: 1 },
        { id: 102, value: 'Email Stakeholders', isCompleted: true, order: 2 },
      ],
    },
    {
      id: 2,
      name: 'Groceries',
      todos: [
        { id: 201, value: 'Milk', isCompleted: false, order: 1 },
        { id: 202, value: 'Bread', isCompleted: false, order: 2 },
      ],
    },
  ],
  totalCount: 2,
};

test.describe('Todo App E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Enable request logging for debugging
    page.on('console', (msg) => console.log(`Browser Console: ${msg.text()}`));

    // Robust Mocking
    await page.route('**/login', async (route) => {
      if (route.request().method() === 'POST') {
        console.log('Mocking Login POST');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ accessToken: 'fake-token', expiresIn: 3600 }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/register', async (route) => {
      if (route.request().method() === 'POST') {
        console.log('Mocking Register POST');
        await route.fulfill({ status: 200 });
      } else {
        await route.continue();
      }
    });

    await page.route('**/manage/info', async (route) => {
      console.log(`Mocking Manage Info ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });

    await page.route('**/settings*', async (route) => {
      console.log(`Mocking Settings ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ theme: 'LIGHT', language: 'ENGLISH' }),
      });
    });

    await page.route('**/lists*', async (route) => {
      console.log(`Mocking Lists ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LISTS),
      });
    });

    await page.route('**/todos*', async (route) => {
      console.log(`Mocking Todos ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LISTS),
      });
    });
  });

  test('should login and view dashboard', async ({ page }) => {
    // 1. Login Page
    console.log('Navigating to Login...');
    await page.goto('http://localhost:5173/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

    // 2. Register Page
    console.log('Navigating to Register...');
    await page.getByRole('link', { name: 'Create an account' }).click();
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();

    // 3. Main Todo Dashboard (Simulate Login)
    console.log('Simulating Login...');
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for the dashboard to load
    console.log('Waiting for Dashboard content...');
    await expect(page.getByText('Work Projects')).toBeVisible();
    await expect(page.getByText('Finish Q1 Report')).toBeVisible();

    console.log('Verification Successful');
  });
});
