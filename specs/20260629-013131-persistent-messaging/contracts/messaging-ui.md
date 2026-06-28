# UI Contract — Messages Page

**Route:** `/[locale]/messages`  
**Server entry:** `src/app/[locale]/messages/page.tsx`  
**Client entry:** `src/app/[locale]/messages/MessagesClient.tsx`

## Server props → Client

```typescript
interface MessagesPageProps {
  locale: string;
  userId: string;
  initialThreads: ConversationThread[];
  initialMessages: MessageRow[];
  initialMatchId: string | null; // first mutual match UUID, or null
}

interface ConversationThread {
  matchId: string;           // UUID; "welcome" only in client overlay
  peerId: string;
  peerName: string;
  peerCity: string | null;
  peerAge: number | null;
  avatarUrl: string | null;
  lastMessageContent: string | null;
  lastMessageAt: string | null; // ISO
  unreadCount: number;
  isOnline: boolean;        // false at MVP unless presence ships
}

interface MessageRow {
  id: string;
  senderId: string;
  receiverId: string;
  matchId: string;
  content: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}
```

## Client actions (browser Supabase)

| Action | Method | RLS expectation |
|--------|--------|-----------------|
| Send message | `INSERT` messages | Mutual match policy |
| Mark read | `UPDATE` read, read_at | Receiver-only policy |
| Load older | `SELECT` paginated | Sender/receiver SELECT |
| Realtime | `channel().on('postgres_changes')` | Filter `match_id` |

## Premium stubs (no backend)

| UI control | Behavior |
|------------|----------|
| Video call | `useSubscription` → paywall |
| Voice / image | `useSubscription` → paywall |
| Text input | Always enabled for mutual matches |

## i18n namespace

`common.messagesPage` — all labels, errors, welcome thread strings.
