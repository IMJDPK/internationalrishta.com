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
 * Platform is now FREE for all users - full access to all features
 */
export function useSubscription(): SubscriptionData {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    status: "active",
    hasAccess: true,
    features: {
      messaging: true,
      videoCall: true,
      unlimitedSwipes: true,
      profileBoosts: true,
      advancedFilters: true,
    },
  });

  useEffect(() => {
    // Platform is FREE - all users get full access
    const freeSubscription: SubscriptionData = {
      tier: "free",
      status: "active",
      hasAccess: true,
      features: {
        messaging: true,
        videoCall: true,
        unlimitedSwipes: true,
        profileBoosts: true,
        advancedFilters: true,
      },
    };

    setSubscription(freeSubscription);
  }, []);

  return subscription;
}
