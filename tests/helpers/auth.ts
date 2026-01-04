import { Page } from '@playwright/test';

const TEST_SECRET = process.env.AUTH_TEST_SECRET || 'test-secret';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Create an authenticated session for testing
 * Bypasses magic link flow entirely
 */
export async function loginAsViewer(
  page: Page,
  email = 'test-viewer@example.com'
) {
  const response = await page.request.post(`${BASE_URL}/api/auth/test-session`, {
    data: {
      secret: TEST_SECRET,
      email,
      role: 'viewer',
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test session: ${await response.text()}`);
  }

  // Refresh page to pick up session cookie
  await page.reload();
}

/**
 * Create an admin session for testing
 */
export async function loginAsAdmin(page: Page) {
  const response = await page.request.post(`${BASE_URL}/api/auth/test-session`, {
    data: {
      secret: TEST_SECRET,
      email: 'admin@test.com',
      role: 'admin',
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test session: ${await response.text()}`);
  }

  await page.reload();
}

/**
 * Logout the current session
 */
export async function logout(page: Page) {
  await page.request.post(`${BASE_URL}/api/auth/logout`);
  await page.reload();
}
