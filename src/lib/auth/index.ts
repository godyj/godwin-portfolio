// Re-export all auth utilities for convenient imports
export { redis } from './redis';
export { requestRatelimit, verifyRatelimit, testSessionRatelimit } from './ratelimit';
export { validateEmail, validateToken, emailSchema, tokenSchema } from './validation';
export { createMagicLink, verifyMagicLink } from './tokens';
export {
  createSession,
  getSession,
  destroySession,
  invalidateAllSessions,
} from './sessions';
export {
  sendMagicLink,
  sendAccessRequestNotification,
  sendAccessApprovedNotification,
} from './email';
export type {
  ViewerAccess,
  MagicLinkToken,
  Session,
  SessionWithId,
} from './types';
