"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export type SubscriptionTier = "free" | "premium";
export type SubscriptionStatus = "active" | "expired" | "pending";

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  hasPremium: boolean;
  features: {
    messaging: boolean;      // free for all connected matches
    videoCall: boolean;      // premium only
    voiceMessage: boolean;   // premium only
    imageMessage: boolean;   // premium only
    unlimitedSwipes: boolean;
    profileBoosts: boolean;
    advancedFilters: boolean;
  };
}

export function useSubscription(): SubscriptionData {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    status: "active",
    hasPremium: false,
    features: {
      messaging: true,
      videoCall: false,
      voiceMessage: false,
      imageMessage: false,
      unlimitedSwipes: true,
      profileBoosts: false,
      advancedFilters: false,
    },
  });

  useEffect(() => {
    const checkSubscription = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      const isPremium =
        profile?.subscription_tier === "premium" ||
        profile?.subscription_tier === "direct" ||
        profile?.subscription_tier === "bureau";

      setSubscription({
        tier: isPremium ? "premium" : "free",
        status: "active",
        hasPremium: isPremium,
        features: {
          messaging: true,
          videoCall: isPremium,
          voiceMessage: isPremium,
          imageMessage: isPremium,
          unlimitedSwipes: true,
          profileBoosts: isPremium,
          advancedFilters: isPremium,
        },
      });
    };

    checkSubscription();
  }, []);

  return subscription;
}
