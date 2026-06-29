import {
  PAYMENT_PROOF_ALLOWED_MIME_TYPES,
  PAYMENT_PROOF_MAX_BYTES,
  type PaymentProofMimeType,
} from "@/types/billing.types";

export interface ProofFileValidationResult {
  valid: boolean;
  errorKey?: "fileTooLarge" | "invalidType" | "emptyFile";
  mimeType?: PaymentProofMimeType;
  extension?: string;
}

const MIME_TO_EXT: Record<PaymentProofMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

/** Client-side whitelist aligned to payment-proofs bucket (jpeg/png/webp/pdf). */
const UPLOAD_MIME_WHITELIST: readonly PaymentProofMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function validateProofFile(file: File): ProofFileValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, errorKey: "emptyFile" };
  }

  if (file.size > PAYMENT_PROOF_MAX_BYTES) {
    return { valid: false, errorKey: "fileTooLarge" };
  }

  const mime = file.type as PaymentProofMimeType;
  if (!UPLOAD_MIME_WHITELIST.includes(mime)) {
    return { valid: false, errorKey: "invalidType" };
  }

  return {
    valid: true,
    mimeType: mime,
    extension: MIME_TO_EXT[mime],
  };
}

export function buildManualProofStoragePath(
  userId: string,
  extension: string
): string {
  const fileId = crypto.randomUUID();
  const ext = extension.replace(/^\./, "").toLowerCase();
  return `${userId}/${fileId}_receipt.${ext}`;
}
