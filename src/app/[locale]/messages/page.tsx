import MessagesClient from "./MessagesClient";
import {
  fetchConversationThreads,
  fetchThreadMessages,
} from "@/lib/messaging/queries";
import type { MessagesPageInitialData } from "@/lib/messaging/types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  const initialThreads = await fetchConversationThreads(supabase, user.id);
  const initialMatchId = initialThreads[0]?.matchId ?? null;

  const initialMessages = initialMatchId
    ? await fetchThreadMessages(supabase, initialMatchId, { limit: 50 })
    : [];

  const initialData: MessagesPageInitialData = {
    locale,
    userId: user.id,
    initialThreads,
    initialMessages,
    initialMatchId,
  };

  return <MessagesClient initialData={initialData} />;
}
