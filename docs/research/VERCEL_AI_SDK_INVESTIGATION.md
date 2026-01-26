# Vercel AI SDK Investigation

**Date:** January 25, 2026  
**Purpose:** Evaluate feasibility of adding a conversational UI to the portfolio admin dashboard  
**Status:** Research Complete

---

## Executive Summary

The Vercel AI SDK is a mature, production-ready toolkit that would integrate seamlessly with the existing portfolio stack. The combination of AI SDK Core (for tool calling), AI SDK UI (for chat hooks), and AI Elements (for pre-built components) makes implementing a conversational admin interface highly feasible with relatively low effort.

**Recommendation:** Implement as a Phase 2 enhancement after core admin functionality is stable.

---

## SDK Capabilities Overview

### Architecture

The AI SDK consists of three main modules:

| Module | Purpose | Status |
|--------|---------|--------|
| **AI SDK Core** | Unified API for text generation, structured data, tool calling, agents | Stable (v6) |
| **AI SDK UI** | Framework-agnostic hooks (`useChat`, `useCompletion`, `useObject`) | Stable |
| **AI SDK RSC** | React Server Components streaming | Paused Development |

### Key Features (AI SDK 6)

1. **ToolLoopAgent**: Production-ready agent implementation with automatic tool execution loops
2. **Tool Execution Approval**: Human-in-the-loop with `needsApproval` flag
3. **DevTools**: Built-in debugging and telemetry
4. **MCP Support**: Model Context Protocol for external service integration
5. **Multi-Provider Support**: OpenAI, Anthropic, Google, Azure, AWS Bedrock, and 15+ others

### AI Elements (UI Components)

A new component library built on shadcn/ui specifically for AI interfaces:

- **20+ components**: Message, Conversation, Response, PromptInput, CodeBlock, Reasoning, etc.
- **Streaming-optimized**: Handles incremental updates efficiently
- **Accessible**: Built on Radix UI primitives
- **Customizable**: Full source code ownership via shadcn/ui pattern

Installation:
```bash
npx ai-elements@latest add message conversation prompt-input response
```

---

## Integration with Current Stack

### Compatibility Matrix

| Requirement | Portfolio Stack | AI SDK Requirement | Status |
|-------------|-----------------|-------------------|--------|
| Framework | Next.js 16.1.1 | Next.js 13+ | ✅ |
| React | 19.2.3 | React 18+ | ✅ |
| TypeScript | 5.x | TypeScript 4.9+ | ✅ |
| Zod | 4.3.4 | Zod 3+ | ✅ |
| Tailwind | v4 | Any | ✅ |

### Required New Dependencies

```json
{
  "ai": "^4.x",
  "@ai-sdk/react": "^1.x",
  "@ai-sdk/openai": "^1.x"  // or another provider
}
```

### Integration Pattern

**Backend (API Route):**
```typescript
// src/app/admin/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are an admin assistant for a portfolio website...',
    messages,
    tools: {
      approveViewer: tool({
        description: 'Approve a viewer for access to projects',
        parameters: z.object({
          email: z.string().email(),
          projects: z.array(z.string()).optional(),
        }),
        execute: async ({ email, projects }) => {
          // Call existing admin API
          const res = await fetch('/admin/api/approve', {
            method: 'POST',
            body: JSON.stringify({ email, projects }),
          });
          return { success: res.ok };
        },
      }),
      // ... more tools
    },
  });
  
  return result.toUIMessageStreamResponse();
}
```

**Frontend (Chat Component):**
```typescript
// src/app/admin/components/AdminChat.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { 
  Conversation, 
  ConversationContent,
  Message, 
  MessageContent,
  Response,
  PromptInput 
} from '@/components/ai-elements';

export function AdminChat() {
  const { messages, sendMessage, status } = useChat({
    api: '/admin/api/chat',
  });

  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              <Response>{message.content}</Response>
            </MessageContent>
          </Message>
        ))}
      </ConversationContent>
      <PromptInput 
        onSubmit={sendMessage} 
        disabled={status !== 'ready'}
      />
    </Conversation>
  );
}
```

---

## Use Cases for Admin Dashboard

### 1. Conversational Viewer Management

| Natural Language Command | Tool Execution |
|--------------------------|----------------|
| "approve john@example.com for Jarvis" | `approveViewer({ email, projects: ['jarvis'] })` |
| "deny the pending request from spam@test.com" | `denyViewer({ email })` |
| "give sarah@company.com access to all projects" | `approveViewer({ email, projects: [] })` |
| "revoke access for john@example.com" | `revokeViewer({ email })` |
| "set expiration for john@example.com to 30 days" | `setExpiration({ email, days: 30 })` |

### 2. Natural Language Queries

| Query | Tool Execution | Response |
|-------|---------------|----------|
| "who has access to Jarvis?" | `queryViewers({ project: 'jarvis' })` | "3 viewers have access: john@..., sarah@..., mike@..." |
| "show me pending requests" | `queryViewers({ status: 'pending' })` | "You have 2 pending requests from..." |
| "how many viewers are approved?" | `queryViewers({ status: 'approved' })` | "Currently 5 approved viewers" |
| "which viewers expire this week?" | `queryViewers({ expiringWithin: 7 })` | "2 viewers expire soon: ..." |

### 3. Bulk Operations

| Command | Tool Execution |
|---------|---------------|
| "archive all denied viewers" | `bulkArchive({ status: 'denied' })` |
| "extend all expiring viewers by 30 days" | `bulkExtend({ expiringWithin: 7, days: 30 })` |
| "lock the Sacred Knot project" | `toggleProjectLock({ projectId: 'sacred-knot', locked: true })` |

### 4. Project Management

| Command | Tool Execution |
|---------|---------------|
| "show me all locked projects" | `queryProjects({ locked: true })` |
| "make Jarvis public" | `toggleProjectLock({ projectId: 'jarvis', locked: false })` |

---

## Tool Definitions (Proof of Concept)

```typescript
// src/app/admin/api/chat/tools.ts
import { tool } from 'ai';
import { z } from 'zod';

export const adminTools = {
  approveViewer: tool({
    description: 'Approve a viewer for access to specific projects or all projects',
    parameters: z.object({
      email: z.string().email().describe('The email address of the viewer to approve'),
      projects: z.array(z.string()).optional().describe('Project IDs to grant access to. Empty array = all projects'),
      expirationDays: z.number().optional().describe('Number of days until access expires'),
    }),
    execute: async ({ email, projects, expirationDays }) => {
      // Implementation connects to existing API
    },
  }),

  denyViewer: tool({
    description: 'Deny a pending viewer request',
    parameters: z.object({
      email: z.string().email(),
    }),
    execute: async ({ email }) => {
      // Implementation
    },
  }),

  revokeViewer: tool({
    description: 'Revoke an approved viewer\'s access',
    parameters: z.object({
      email: z.string().email(),
    }),
    needsApproval: true, // Requires confirmation
    execute: async ({ email }) => {
      // Implementation
    },
  }),

  queryViewers: tool({
    description: 'Query viewers by status, project access, or expiration',
    parameters: z.object({
      status: z.enum(['pending', 'approved', 'denied', 'archived']).optional(),
      project: z.string().optional(),
      expiringWithin: z.number().optional().describe('Days until expiration'),
    }),
    execute: async (params) => {
      // Implementation
    },
  }),

  toggleProjectLock: tool({
    description: 'Lock or unlock a project',
    parameters: z.object({
      projectId: z.string(),
      locked: z.boolean(),
    }),
    execute: async ({ projectId, locked }) => {
      // Implementation
    },
  }),

  bulkArchive: tool({
    description: 'Archive multiple viewers based on criteria',
    parameters: z.object({
      status: z.enum(['denied', 'expired']).optional(),
      olderThan: z.number().optional().describe('Days since last activity'),
    }),
    needsApproval: true,
    execute: async (params) => {
      // Implementation
    },
  }),
};
```

---

## Implementation Approach

### Recommended: Phased Implementation

**Phase 1: Foundation (2-3 hours)**
1. Install dependencies (`ai`, `@ai-sdk/react`, provider package)
2. Set up API route at `/admin/api/chat`
3. Create basic chat component with `useChat`
4. Add 2-3 core tools (approveViewer, queryViewers, denyViewer)

**Phase 2: UI Polish (1-2 hours)**
1. Install AI Elements components
2. Integrate with existing admin dashboard layout
3. Add loading states and error handling

**Phase 3: Advanced Features (2-3 hours)**
1. Add remaining tools (bulk operations, project management)
2. Implement `needsApproval` for destructive actions
3. Add conversation history persistence (optional)

### UI Integration Options

**Option A: Sliding Panel**
Chat panel slides in from right side of admin dashboard. Keeps current UI intact.

**Option B: Tab-based**
Add "Assistant" tab alongside existing admin sections.

**Option C: Floating Widget**
Persistent chat bubble in corner of admin area.

**Recommendation:** Option A (Sliding Panel) - Non-intrusive, maintains current workflow, easy to toggle.

---

## Cost Considerations

| Provider | Model | Estimated Cost/1000 requests |
|----------|-------|------------------------------|
| OpenAI | gpt-4o-mini | ~$0.30 |
| OpenAI | gpt-4o | ~$7.50 |
| Anthropic | claude-3-haiku | ~$0.50 |
| Anthropic | claude-3-sonnet | ~$6.00 |

**Recommendation:** Start with `gpt-4o-mini` or `claude-3-haiku` - sufficient for admin commands, cost-effective.

---

## Security Considerations

1. **Authentication**: Chat API must verify admin session before processing
2. **Rate Limiting**: Apply rate limits to chat endpoint (reuse existing Upstash setup)
3. **Audit Logging**: Log all tool executions for accountability
4. **Input Validation**: Zod schemas provide type-safe input validation
5. **Tool Approval**: Use `needsApproval` for destructive operations

---

## Pros and Cons

### Advantages
- Faster admin workflows via natural language
- Reduced cognitive load - no need to navigate complex UI
- Bulk operations become trivial
- Consistent with modern admin interfaces (see: Linear, Notion)
- Low implementation effort due to AI SDK abstractions
- Future extensibility for other AI features

### Disadvantages
- Requires API key management
- Ongoing API costs (though minimal for admin use)
- Another dependency to maintain
- Potential learning curve for non-technical admins (though minimal)
- AI SDK RSC is paused (not using this module anyway)

---

## Decision

**Recommendation: IMPLEMENT (Deferred to Phase 2)**

The Vercel AI SDK is well-suited for this use case. However, I recommend completing and stabilizing the current admin dashboard first, then adding the conversational UI as an enhancement.

### Rationale
1. Core admin functionality should be solid before adding AI layer
2. Tools will directly wrap existing API endpoints - clean separation
3. Low risk addition that can be removed if not useful
4. Aligns with modern UX patterns for admin interfaces

### Next Steps (When Ready)
1. Review this document and confirm approach
2. Choose AI provider and obtain API key
3. Implement Phase 1 foundation
4. Evaluate usefulness before proceeding to Phase 2-3

---

## Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [AI SDK UI - Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [AI SDK Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [AI Elements GitHub](https://github.com/vercel/ai-elements)
- [AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6)
- [Chat SDK Template](https://vercel.com/templates/next.js/nextjs-ai-chatbot)
