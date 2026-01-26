# API Reference

> **Last Updated:** 2026-01-25

All API endpoints for the portfolio authentication system.

---

## Public Endpoints

### POST /api/auth/request

Request access or login via magic link.

**Rate Limit:** 5 requests/minute per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "projectId": "jarvis"  // optional, tracks which project user requested from
}
```

**Response:** Always returns success to prevent email enumeration.
```json
{
  "success": true,
  "message": "If this email is approved or pending approval, you will receive further instructions."
}
```

**Behavior by Status:**
| Existing Status | Action |
|-----------------|--------|
| None (new) | Create pending record, notify admin |
| Pending | Do nothing |
| Approved | Send magic link |
| Approved (expired) | Update to denied, do nothing |
| Denied | Do nothing |

---

### GET /api/auth/verify

Verify magic link and create session.

**Rate Limit:** 10 requests/minute per IP

**Query Parameters:**
- `token` - The magic link token (64 hex chars)

**Response:** Redirect to:
- `/` - For viewers
- `/admin` - For admins
- `/auth/error?reason=...` - On error

**Error Reasons:**
- `rate_limited` - Too many attempts
- `invalid_token` - Token invalid, expired, or already used

---

### POST /api/auth/logout

Destroy current session.

**Response:**
```json
{ "success": true }
```

---

### GET /api/auth/logout

Destroy current session and redirect to home.

**Response:** Redirect to `/`

---

## Admin Endpoints

All admin endpoints require an authenticated admin session.

**Auth Error Response:**
```json
{ "error": "Unauthorized" }
```
Status: `401`

---

### GET /admin/api/viewers

List all viewers.

**Response:**
```json
{
  "viewers": [
    {
      "email": "user@example.com",
      "status": "pending",
      "projects": [],
      "requestedProject": "jarvis",
      "expiresAt": null,
      "createdAt": 1706000000000,
      "approvedAt": null
    }
  ]
}
```

**Sort Order:** pending → approved → denied → archived, then by createdAt (newest first)

---

### POST /admin/api/approve

Approve a pending viewer.

**Request Body:**
```json
{
  "email": "user@example.com",
  "expiresAt": 1706500000000  // optional, null for no expiration
}
```

**Response:**
```json
{ "success": true }
```

**Side Effects:**
- Updates status to `approved`
- Sets `approvedAt` timestamp
- Removes from `pending_viewers` set
- Creates magic link
- Sends approval email

---

### POST /admin/api/revoke

Revoke or deny a viewer's access.

**Request Body:**
```json
{
  "email": "user@example.com",
  "deny": true  // optional, used for pending viewers
}
```

**Response:**
```json
{
  "success": true,
  "action": "revoked",  // or "denied"
  "sessionsInvalidated": 2
}
```

**Side Effects:**
- Updates status to `denied`
- Removes from `pending_viewers` set
- Invalidates all active sessions

---

### POST /admin/api/update-access

Update an approved viewer's project access.

**Request Body:**
```json
{
  "email": "user@example.com",
  "projects": ["jarvis", "xcode-touch-bar"],  // empty = all projects
  "expiresAt": 1706500000000  // optional
}
```

**Response:**
```json
{
  "success": true,
  "viewer": { ... }  // updated ViewerAccess object
}
```

**Validation:**
- Viewer must have `approved` status
- All project IDs must be valid locked projects

---

### POST /admin/api/archive

Archive or restore a viewer.

**Request Body:**
```json
{
  "email": "user@example.com",
  "restore": false  // true to unarchive
}
```

**Archive Response:**
```json
{
  "success": true,
  "action": "archived",
  "sessionsInvalidated": 1
}
```

**Restore Response:**
```json
{
  "success": true,
  "action": "restored",
  "newStatus": "denied"
}
```

**Notes:**
- Archive invalidates all sessions
- Restore sets status to `denied` (admin must re-approve)

---

### GET /admin/api/projects

List all projects with computed lock status.

**Response:**
```json
{
  "projects": [
    {
      "id": "jarvis",
      "title": "Jarvis",
      "subtitle": "Connected Car App",
      "locked": true
    }
  ]
}
```

---

### GET /admin/api/locked-projects

List only currently locked projects.

**Response:**
```json
{
  "projects": [
    {
      "id": "jarvis",
      "title": "Jarvis",
      "subtitle": "Connected Car App"
    }
  ]
}
```

---

### POST /admin/api/toggle-lock

Toggle a project's lock state.

**Request Body:**
```json
{
  "projectId": "jarvis",
  "locked": true
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "jarvis",
  "locked": true
}
```

**Notes:**
- Sets Redis override (`project-lock:{id}`)
- Takes precedence over static `locked` value in `projects.ts`

---

## Error Responses

All endpoints return consistent error format:

```json
{ "error": "Error message here" }
```

**Common Status Codes:**
| Code | Meaning |
|------|---------|
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (no/invalid session) |
| 404 | Not found (viewer/project doesn't exist) |
| 429 | Rate limited |
| 500 | Server error |

---

## Related Documentation

- [Auth System Architecture](AUTH_SYSTEM.md) - System design
- [Auth Security Review](../review/AUTH_SECURITY_REVIEW.md) - Security analysis
