/**
 * Bureau partners types — Phase D
 * @see supabase/migrations/20260629211647_bureau_partners.sql
 * @see .specify/bureau-partners-directory/constitution.md
 */

import type { SubscriptionTierDb } from "@/types/billing.types";

/** `marriage_bureaus.commission_type` */
export type CommissionType = "flat" | "percentage";

/** `bureau_commissions.status` */
export type BureauCommissionStatus = "accrued" | "paid" | "void";

/** `marriage_bureaus.status` (bureau-approval-migration) */
export type MarriageBureauStatus =
  | "pending"
  | "payment_pending"
  | "approved"
  | "rejected";

export interface DbMarriageBureauRow {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  referral_code: string;
  total_referrals: number;
  verified: boolean;
  rating: number;
  total_reviews: number;
  is_approved: boolean;
  commission_type: CommissionType;
  commission_rate: number;
  approved_at: string | null;
  approved_by: string | null;
  status?: MarriageBureauStatus;
  created_at: string;
  updated_at: string;
}

/** Public directory card — approved bureaus only */
export interface PublicBureauDirectoryRow {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  referral_code: string;
  rating: number;
  total_referrals: number;
}

export interface DbBureauCommissionRow {
  id: string;
  bureau_id: string;
  user_id: string;
  subscription_id: string;
  subscription_amount: number;
  commission_type: CommissionType;
  commission_rate: number;
  commission_amount: number;
  status: BureauCommissionStatus;
  accrued_at: string;
  paid_at: string | null;
  void_reason: string | null;
  created_at: string;
}

export type AccrueCommissionSkipReason =
  | "no_referral"
  | "direct_tier"
  | "bureau_not_approved"
  | "bureau_not_found"
  | "duplicate";

export interface AccrueCommissionInput {
  subscriptionId: string;
  userId: string;
  tier: SubscriptionTierDb;
  subscriptionAmount: number;
}

export interface AccrueCommissionResult {
  accrued: boolean;
  commissionId?: string;
  commissionAmount?: number;
  skippedReason?: AccrueCommissionSkipReason;
}

export type ReferralAttributeSkipReason =
  | "already_set"
  | "invalid_code"
  | "no_cookie";

export interface ReferralAttributeResult {
  attributed: boolean;
  bureauId?: string;
  referralCode?: string;
  reason?: ReferralAttributeSkipReason;
}
