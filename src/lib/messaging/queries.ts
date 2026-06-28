import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildConversationThread,
  getPeerIdFromMatch,
  mapDbMessagesToMessageRows,
  type ConversationThread,
  type DbMatchRow,
  type DbMatchWithProfiles,
  type DbMessageRow,
  type DbPhotoRow,
  type DbProfileRow,
  type MessageRow,
} from "@/lib/messaging/types";

const MATCH_SELECT = `
  id,
  user_id,
  matched_user_id,
  user_liked,
  matched_liked,
  is_match,
  matched_at,
  created_at
`;

const MESSAGE_SELECT =
  "id, sender_id, receiver_id, match_id, content, encrypted, read, read_at, created_at";

const PROFILE_SELECT = "id, full_name, date_of_birth, city, verified, last_active";

const PHOTO_SELECT = "id, user_id, url, is_primary, order_index, created_at";

const DEFAULT_MESSAGE_LIMIT = 50;

type MessagingSupabase = SupabaseClient;

function pickPrimaryPhotoUrl(photos: DbPhotoRow[], userId: string): string | null {
  const userPhotos = photos.filter((p) => p.user_id === userId);
  if (userPhotos.length === 0) return null;
  const primary = userPhotos.find((p) => p.is_primary);
  if (primary) return primary.url;
  const sorted = [...userPhotos].sort((a, b) => a.order_index - b.order_index);
  return sorted[0]?.url ?? null;
}

function indexLastMessagesByMatchId(rows: DbMessageRow[]): Map<string, DbMessageRow> {
  const map = new Map<string, DbMessageRow>();
  for (const row of rows) {
    if (!map.has(row.match_id)) {
      map.set(row.match_id, row);
    }
  }
  return map;
}

function countUnreadByMatchId(
  rows: Pick<DbMessageRow, "match_id">[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.match_id, (counts.get(row.match_id) ?? 0) + 1);
  }
  return counts;
}

function attachProfilesToMatches(
  matches: DbMatchRow[],
  profiles: DbProfileRow[]
): DbMatchWithProfiles[] {
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  return matches.map((match) => ({
    ...match,
    user_profile: profileMap.get(match.user_id) ?? null,
    matched_profile: profileMap.get(match.matched_user_id) ?? null,
  }));
}

function sortThreads(threads: ConversationThread[]): ConversationThread[] {
  return [...threads].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Fetch mutual-match conversation threads for the authenticated user.
 * Relies on Postgres RLS; queries additionally filter `is_match = true`.
 */
export async function fetchConversationThreads(
  supabase: MessagingSupabase,
  userId: string
): Promise<ConversationThread[]> {
  const { data: matchRows, error: matchError } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .eq("is_match", true)
    .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`);

  if (matchError || !matchRows?.length) {
    return [];
  }

  const matches = matchRows as DbMatchRow[];
  const matchIds = matches.map((m) => m.id);
  const peerIds = matches.map((m) => getPeerIdFromMatch(m, userId));

  const [profilesResult, photosResult, unreadResult, recentMessagesResult] = await Promise.all([
    supabase.from("profiles").select(PROFILE_SELECT).in("id", peerIds),
    supabase.from("photos").select(PHOTO_SELECT).in("user_id", peerIds),
    supabase
      .from("messages")
      .select("match_id")
      .eq("receiver_id", userId)
      .eq("read", false)
      .in("match_id", matchIds),
    supabase
      .from("messages")
      .select(MESSAGE_SELECT)
      .in("match_id", matchIds)
      .order("created_at", { ascending: false }),
  ]);

  const profiles = (profilesResult.data ?? []) as DbProfileRow[];
  const photos = (photosResult.data ?? []) as DbPhotoRow[];
  const unreadRows = (unreadResult.data ?? []) as Pick<DbMessageRow, "match_id">[];
  const recentMessages = (recentMessagesResult.data ?? []) as DbMessageRow[];

  const matchesWithProfiles = attachProfilesToMatches(matches, profiles);
  const lastMessageByMatch = indexLastMessagesByMatchId(recentMessages);
  const unreadByMatch = countUnreadByMatchId(unreadRows);

  const threads = matchesWithProfiles.map((match) => {
    const peerId = getPeerIdFromMatch(match, userId);
    const avatarUrl = pickPrimaryPhotoUrl(photos, peerId);
    const lastMessage = lastMessageByMatch.get(match.id) ?? null;
    const unreadCount = unreadByMatch.get(match.id) ?? 0;
    return buildConversationThread(match, userId, avatarUrl, lastMessage, unreadCount);
  });

  return sortThreads(threads);
}

export interface FetchThreadMessagesOptions {
  limit?: number;
  before?: string;
}

/**
 * Fetch messages for a single thread (ascending by `created_at`).
 */
export async function fetchThreadMessages(
  supabase: MessagingSupabase,
  matchId: string,
  options: FetchThreadMessagesOptions = {}
): Promise<MessageRow[]> {
  const limit = options.limit ?? DEFAULT_MESSAGE_LIMIT;

  let query = supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (options.before) {
    query = query.lt("created_at", options.before);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return mapDbMessagesToMessageRows(data as DbMessageRow[]);
}

/**
 * Mark all unread messages in a thread as read for the current recipient.
 */
export async function markThreadRead(
  supabase: MessagingSupabase,
  matchId: string,
  userId: string
): Promise<void> {
  const readAt = new Date().toISOString();
  await supabase
    .from("messages")
    .update({ read: true, read_at: readAt })
    .eq("match_id", matchId)
    .eq("receiver_id", userId)
    .eq("read", false);
}
