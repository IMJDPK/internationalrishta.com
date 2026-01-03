"use client";

import { useEffect, useState } from "react";

export type SubscriptionTier = "free" | "trial" | "bureau" | "direct";
export type SubscriptionStatus = "active" | "expired" | "pending";

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  hasAccess: boolean;
  trialEndsAt?: Date;
  features: {
    messaging: boolean;
    videoCall: boolean;
    unlimitedSwipes: boolean;
    profileBoosts: boolean;
    advancedFilters: boolean;
  };
}

/**
 * Hook to check user's subscription status and feature access
 * TODO: Connect to Supabase when auth is implemented
 */
export function useSubscription(): SubscriptionData {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    status: "expired",
    hasAccess: false,
    features: {
      messaging: false,
      videoCall: false,
      unlimitedSwipes: false,
      profileBoosts: false,
      advancedFilters: false,
    },
  });

  useEffect(() => {
    // TODO: Fetch from Supabase
    // For now, mock data - you can test by changing tier here
    const mockSubscription: SubscriptionData = {
      tier: "free", // Change to 'trial', 'bureau', or 'direct' to test
      status: "expired",
      hasAccess: false,
      trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      features: {
        messaging: false,
        videoCall: false,
        unlimitedSwipes: false,
        profileBoosts: false,
        advancedFilters: false,
      },
    };

    // Grant features based on tier
    if (mockSubscription.tier === "trial") {
      mockSubscription.hasAccess = true;
      mockSubscription.status = "active";
      mockSubscription.features.messaging = true;
      mockSubscription.features.unlimitedSwipes = true;
    } else if (
      mockSubscription.tier === "bureau" ||
      mockSubscription.tier === "direct"
    ) {
      mockSubscription.hasAccess = true;
      mockSubscription.status = "active";
      mockSubscription.features.messaging = true;
      mockSubscription.features.videoCall = true;
      mockSubscription.features.unlimitedSwipes = true;
      mockSubscription.features.advancedFilters = true;
      if (mockSubscription.tier === "direct") {
        mockSubscription.features.profileBoosts = true;
      }
    }

    setSubscription(mockSubscription);
  }, []);

  return subscription;
}
