/**
 * Messaging types aligned to `supabase/schema.sql` and `contracts/messaging-ui.md`.
 */

// ---------------------------------------------------------------------------
// Database row types (snake_case — mirrors Postgres columns)
// ---------------------------------------------------------------------------

export type ProfileGender = "male" | "female";
export type MaritalStatus = "never_married" | "divorced" | "widowed";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type SubscriptionTier = "referral" | "direct";
export type SubscriptionStatus = "active" | "cancelled" | "expired";

/** `public.messages` */
export interface DbMessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  match_id: string;
  content: string;
  encrypted: boolean;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

/** `public.matches` */
export interface DbMatchRow {
  id: string;
  user_id: string;
  matched_user_id: string;
  user_liked: boolean | null;
  matched_liked: boolean | null;
  is_match: boolean;
  matched_at: string | null;
  created_at: string;
}

/** `public.profiles` — fields used by messaging UI */
export interface DbProfileRow {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  city: string | null;
  verified: boolean;
  last_active: string | null;
}

/** `public.photos` */
export interface DbPhotoRow {
  id: string;
  user_id: string;
  url: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

/** Embedded profile join on match queries */
export interface DbMatchWithProfiles extends DbMatchRow {
  user_profile: DbProfileRow | null;
  matched_profile: DbProfileRow | null;
}

// ---------------------------------------------------------------------------
// Application DTOs (camelCase — UI / server props)
// ---------------------------------------------------------------------------

/** Virtual welcome thread id — never stored in `public.messages` */
export const WELCOME_THREAD_ID = "welcome";

export interface ConversationThread {
  matchId: string;
  peerId: string;
  peerName: string;
  peerCity: string | null;
  peerAge: number | null;
  avatarUrl: string | null;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isOnline: boolean;
}

export interface MessageRow {
  id: string;
  senderId: string;
  receiverId: string;
  matchId: string;
  content: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface MessagesPageInitialData {
  locale: string;
  userId: string;
  initialThreads: ConversationThread[];
  initialMessages: MessageRow[];
  initialMatchId: string | null;
}

// ---------------------------------------------------------------------------
// Insert / update payloads
// ---------------------------------------------------------------------------

export interface MessageInsertPayload {
  sender_id: string;
  receiver_id: string;
  match_id: string;
  content: string;
  encrypted?: boolean;
  read?: boolean;
}

export interface MessageReadUpdatePayload {
  read: true;
  read_at: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function mapDbMessageToMessageRow(row: DbMessageRow): MessageRow {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    matchId: row.match_id,
    content: row.content,
    read: row.read,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export function mapDbMessagesToMessageRows(rows: DbMessageRow[]): MessageRow[] {
  return rows.map(mapDbMessageToMessageRow);
}

export function mapMessageRowToInsertPayload(
  row: Pick<MessageRow, "senderId" | "receiverId" | "matchId" | "content">
): MessageInsertPayload {
  return {
    sender_id: row.senderId,
    receiver_id: row.receiverId,
    match_id: row.matchId,
    content: row.content,
    encrypted: true,
    read: false,
  };
}

/** Resolve the other participant in a mutual match for the current user. */
export function getPeerIdFromMatch(match: DbMatchRow, currentUserId: string): string {
  return match.user_id === currentUserId ? match.matched_user_id : match.user_id;
}

export function getPeerProfileFromMatch(
  match: DbMatchWithProfiles,
  currentUserId: string
): DbProfileRow | null {
  if (match.user_id === currentUserId) {
    return match.matched_profile;
  }
  return match.user_profile;
}

/** Age in years from `date_of_birth` (YYYY-MM-DD); null if unknown. */
export function calculateAgeFromBirthDate(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function buildConversationThread(
  match: DbMatchWithProfiles,
  currentUserId: string,
  peerPhotoUrl: string | null,
  lastMessage: DbMessageRow | null,
  unreadCount: number
): ConversationThread {
  const peer = getPeerProfileFromMatch(match, currentUserId);
  return {
    matchId: match.id,
    peerId: getPeerIdFromMatch(match, currentUserId),
    peerName: peer?.full_name ?? "",
    peerCity: peer?.city ?? null,
    peerAge: calculateAgeFromBirthDate(peer?.date_of_birth ?? null),
    avatarUrl: peerPhotoUrl,
    lastMessageContent: lastMessage?.content ?? null,
    lastMessageAt: lastMessage?.created_at ?? match.matched_at,
    unreadCount,
    isOnline: false,
  };
}
