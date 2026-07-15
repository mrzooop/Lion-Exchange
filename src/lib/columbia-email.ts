const COLUMBIA_EMAIL_PATTERN = /^[^\s@]+@columbia\.edu$/i;

export function isColumbiaEmail(email: string): boolean {
  return COLUMBIA_EMAIL_PATTERN.test(email.trim());
}
