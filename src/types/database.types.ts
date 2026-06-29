/**
 * Database row type aliases for Supabase queries.
 * Domain-specific modules extend this surface (e.g. billing.types.ts, bureau.types.ts).
 */

export type {
  AccrueCommissionInput,
  AccrueCommissionResult,
  AccrueCommissionSkipReason,
  BureauCommissionStatus,
  CommissionType,
  DbBureauCommissionRow,
  DbMarriageBureauRow,
  MarriageBureauStatus,
  ReferralAttributeResult,
  ReferralAttributeSkipReason,
} from "@/types/bureau.types";

/** `profiles` referral columns used by Phase D attribution */
export interface ProfileReferralFields {
  referred_by_bureau_id: string | null;
  referral_code: string | null;
}
