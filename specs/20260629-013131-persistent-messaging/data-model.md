# Data Model — Persistent Messaging

**Source of truth:** `supabase/schema.sql`  
**Feature constitution:** `.specify/persistent-messaging/constitution.md`

## Entities

### Match (`public.matches`)

| Field | Type | Messaging rule |
|-------|------|----------------|
| `id` | uuid PK | Thread key; FK on `messages.match_id` |
| `user_id` | uuid → profiles | Participant A |
| `matched_user_id` | uuid → profiles | Participant B |
| `is_match` | boolean | MUST be `true` to message |
| `matched_at` | timestamptz | Conversation sort order |
| `user_liked`, `matched_liked` | boolean | Discover feature (out of scope) |

**State:** Pre-match (`is_match = false`) → no messaging. Mutual (`is_match = true`) → messaging allowed.

### Message (`public.messages`)

| Field | Type | Validation |
|-------|------|------------|
| `id` | uuid PK | Server-generated |
| `sender_id` | uuid | MUST equal `auth.uid()` on insert |
| `receiver_id` | uuid | Other participant; MUST ≠ sender |
| `match_id` | uuid | MUST reference mutual match row |
| `content` | text | Required; max 2000 chars (app) |
| `encrypted` | boolean | Default `true`; MVP plaintext body |
| `read` | boolean | Default `false`; receiver sets `true` |
| `read_at` | timestamptz | Set when `read` becomes true |
| `created_at` | timestamptz | Thread ordering |

**Immutability:** No DELETE; no UPDATE on `content`, parties, or `match_id`.

### Profile (`public.profiles`) — read-only for messaging

Display fields: `full_name`, `city`, `date_of_birth` (age calc), `verified`, `last_active`.

### Photo (`public.photos`) — read-only for messaging

Primary avatar: `is_primary = true` or lowest `order_index`.

## Virtual entity (client-only)

### Welcome thread (`id: "welcome"`)

- Not stored in `public.messages`.
- Static i18n-driven content for International Rishta Team onboarding.
- Always first in sidebar list.

## Relationships

```text
profiles 1──* matches (as user_id)
profiles 1──* matches (as matched_user_id)
matches 1──* messages
profiles 1──* messages (as sender_id)
profiles 1──* messages (as receiver_id)
```

## Indexes (existing + new)

| Index | Columns | Purpose |
|-------|---------|---------|
| `messages_sender_id_idx` | `sender_id` | Existing |
| `messages_receiver_id_idx` | `receiver_id` | Existing |
| `messages_match_id_created_at_idx` | `(match_id, created_at DESC)` | **New** — thread load + last message |

## Unread count derivation

```text
COUNT(*) WHERE receiver_id = current_user AND read = false GROUP BY match_id
```

## Payment admin migration

`COMPLETE_PAYMENT_ADMIN_MIGRATION.sql` does not alter messaging schema; no cross-dependencies.
