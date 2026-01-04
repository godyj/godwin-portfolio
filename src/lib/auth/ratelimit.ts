import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// Rate limit for access requests: 5 per minute per IP
export const requestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'ratelimit:request',
});

// Rate limit for test-session (stricter): 10 per minute
export const testSessionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:test',
});

// Rate limit for magic link verification: 10 per minute per IP
export const verifyRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:verify',
});
