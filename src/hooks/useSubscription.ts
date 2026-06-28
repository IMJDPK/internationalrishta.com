"use client";

import { createClient } from "@/lib/supabase/client";
import type { SourceChannel, SubscriptionTierDb } from "@/types/billing.types";
import { useEffect, useState } from "react";

export type SubscriptionTier = "free" | "premium";
export type SubscriptionStatus = "active" | "expired" | "pending" | "cancelled";

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  hasPremium: boolean;
  accountActive: boolean;
  subscriptionTierDb: SubscriptionTierDb | null;
  sourceChannel: SourceChannel | null;
  expiresAt: string | null;
  isLoading: boolean;
  features: {
    messaging: boolean;
    videoCall: boolean;
    voiceMessage: boolean;
    imageMessage: boolean;
    unlimitedSwipes: boolean;
    profileBoosts: boolean;
    advancedFilters: boolean;
  };
}

const DEFAULT_FEATURES = {
  messaging: true,
  videoCall: false,
  voiceMessage: false,
  imageMessage: false,
  unlimitedSwipes: true,
  profileBoosts: false,
  advancedFilters: false,
};

const DEFAULT_STATE: SubscriptionData = {
  tier: "free",
  status: "active",
  hasPremium: false,
  accountActive: false,
  subscriptionTierDb: null,
  sourceChannel: null,
  expiresAt: null,
  isLoading: true,
  features: DEFAULT_FEATURES,
};

function mapProfileStatus(
  subscriptionStatus: string | null | undefined
): SubscriptionStatus {
  if (subscriptionStatus === "expired") return "expired";
  if (subscriptionStatus === "cancelled") return "cancelled";
  if (subscriptionStatus === "active") return "active";
  return "pending";
}

export function useSubscription(): SubscriptionData {
  const [subscription, setSubscription] = useState<SubscriptionData>(
    DEFAULT_STATE
  );

  useEffect(() => {
    const loadSubscription = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubscription({ ...DEFAULT_STATE, isLoading: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_active, subscription_tier, subscription_status")
        .eq("id", user.id)
        .maybeSingle();

      const { data: activeSub } = await supabase
        .from("subscriptions")
        .select("source_channel, tier, period_end, paid")
        .eq("user_id", user.id)
        .eq("paid", true)
        .order("period_end", { ascending: false })
        .limit(1)
        .maybeSingle();

      const accountActive = profile?.account_active === true;
      const hasPremium = accountActive;
      const status = mapProfileStatus(profile?.subscription_status);

      setSubscription({
        tier: hasPremium ? "premium" : "free",
        status,
        hasPremium,
        accountActive,
        subscriptionTierDb:
          (activeSub?.tier as SubscriptionTierDb | undefined) ??
          (profile?.subscription_tier as SubscriptionTierDb | undefined) ??
          null,
        sourceChannel:
          (activeSub?.source_channel as SourceChannel | undefined) ?? null,
        expiresAt: activeSub?.period_end ?? null,
        isLoading: false,
        features: {
          messaging: true,
          videoCall: hasPremium,
          voiceMessage: hasPremium,
          imageMessage: hasPremium,
          unlimitedSwipes: true,
          profileBoosts: hasPremium,
          advancedFilters: hasPremium,
        },
      });
    };

    loadSubscription();
  }, []);

  return subscription;
}
