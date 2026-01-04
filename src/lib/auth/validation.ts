import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

export const tokenSchema = z
  .string()
  .min(32, 'Invalid token')
  .max(64, 'Invalid token')
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid token format');

export function validateEmail(
  email: unknown
): { success: true; email: string } | { success: false; error: string } {
  const result = emailSchema.safeParse(email);
  if (result.success) {
    return { success: true, email: result.data };
  }
  // Get first error message from zod issues
  const issues = result.error.issues;
  return { success: false, error: issues[0]?.message || 'Invalid email' };
}

export function validateToken(
  token: unknown
): { success: true; token: string } | { success: false; error: string } {
  const result = tokenSchema.safeParse(token);
  if (result.success) {
    return { success: true, token: result.data };
  }
  return { success: false, error: 'Invalid token' };
}
