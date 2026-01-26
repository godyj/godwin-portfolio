# Unit Testing Plan: Auth Functions

**Created:** 2026-01-25
**Status:** 🔨 IN PROGRESS - Infrastructure done, core tests written
**Last Updated:** 2026-01-25 20:33 PST

---

## Summary

Add unit test coverage for the auth library functions, particularly the new project locking logic.

---

## What's Done

### Infrastructure
- [x] Vitest installed and configured
- [x] `vitest.config.ts` created with path aliases
- [x] `vitest.setup.ts` with jest-dom matchers
- [x] Test scripts added to `package.json`

### Tests Written (18 tests, all passing)

| File | Tests | Coverage |
|------|-------|----------|
| `src/lib/auth/hasAccessToProject.test.ts` | 10 | `hasAccessToProject()` - all edge cases |
| `src/lib/auth/projects.test.ts` | 8 | `isProjectLocked()`, `getLockedProjectIds()`, `setProjectLockState()` |

---

## What's Remaining

### Priority 1: API Route Tests
| File | Purpose |
|------|---------|
| `src/app/admin/api/toggle-lock/route.test.ts` | Test lock toggle endpoint |
| `src/app/admin/api/projects/route.test.ts` | Test projects list endpoint |

### Priority 2: Component Tests
| File | Purpose |
|------|---------|
| `src/components/InlineProjectSelector.test.tsx` | Test checkbox behavior, onChange callbacks |

### Priority 3: Additional Auth Function Tests
| File | Purpose |
|------|---------|
| `src/lib/auth/sessions.test.ts` | Session management |
| `src/lib/auth/tokens.test.ts` | Token generation/validation |

---

## Commands

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run with coverage report
npm run test:coverage
```

---

## Test Patterns

### Mocking Redis
```typescript
vi.mock('./redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  }
}));
```

### Mocking Projects Data
```typescript
vi.mock('@/data/projects', () => ({
  projects: [
    { id: 'project-1', title: 'Project 1', locked: true },
    { id: 'project-2', title: 'Project 2', locked: false },
  ]
}));
```

### Testing Time-Dependent Code
```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-25T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Test configuration |
| `vitest.setup.ts` | Global test setup |
| `package.json` | Test scripts |
| `src/lib/auth/*.test.ts` | Auth unit tests |

---

## Current Test Results

```
 ✓ src/lib/auth/projects.test.ts (8 tests) 3ms
 ✓ src/lib/auth/hasAccessToProject.test.ts (10 tests) 3ms

 Test Files  2 passed (2)
      Tests  18 passed (18)
   Duration  500ms
```

---

## Next Session Checklist

1. [ ] Review existing tests in `src/lib/auth/`
2. [ ] Add API route tests (Priority 1)
3. [ ] Add component tests for InlineProjectSelector (Priority 2)
4. [ ] Run coverage report to identify gaps
5. [ ] Update COMMS.md when complete