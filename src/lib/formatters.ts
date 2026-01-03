/**
 * Format CNIC input with automatic dash insertion
 * Format: XXXXX-XXXXXXX-X
 */
export function formatCNIC(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");

  // Limit to 13 digits
  const limited = digits.slice(0, 13);

  // Apply formatting
  if (limited.length <= 5) {
    return limited;
  } else if (limited.length <= 12) {
    return `${limited.slice(0, 5)}-${limited.slice(5)}`;
  } else {
    return `${limited.slice(0, 5)}-${limited.slice(5, 12)}-${limited.slice(
      12
    )}`;
  }
}

/**
 * Format Pakistan phone number with automatic dash insertion
 * Format: 03XX-XXXXXXX or +92-3XX-XXXXXXX
 */
export function formatPhone(value: string): string {
  // Remove all non-digit and non-plus characters
  const cleaned = value.replace(/[^\d+]/g, "");

  // Check if it starts with +92
  if (cleaned.startsWith("+92")) {
    const digits = cleaned.slice(3);
    if (digits.length <= 3) {
      return `+92-${digits}`;
    } else {
      return `+92-${digits.slice(0, 3)}-${digits.slice(3, 10)}`;
    }
  }
  // Check if it starts with 0
  else if (cleaned.startsWith("0")) {
    if (cleaned.length <= 4) {
      return cleaned;
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
    }
  }
  // Assume it's without country code or leading 0
  else {
    const digits = cleaned.replace(/\+/g, "");
    if (digits.length <= 3) {
      return digits;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 10)}`;
    }
  }
}

/**
 * Validate CNIC format
 * Returns true if format matches: XXXXX-XXXXXXX-X
 */
export function isValidCNIC(value: string): boolean {
  const cnicPattern = /^\d{5}-\d{7}-\d$/;
  return cnicPattern.test(value.trim());
}

/**
 * Validate Pakistan phone number format
 * Accepts: 03XX-XXXXXXX, 03XXXXXXXXX, +92-3XX-XXXXXXX, +923XXXXXXXXX
 */
export function isValidPhone(value: string): boolean {
  const phonePattern = /^(\+92|0)?3\d{2}[- ]?\d{7}$/;
  return phonePattern.test(value.trim());
}
