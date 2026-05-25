import crypto from "crypto";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS    = "0123456789";
const SYMBOLS   = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const ALL       = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;

export const generateTempPassword = (): string => {
  const pick = (charset: string, count: number): string[] =>
    Array.from({ length: count }, () => charset[crypto.randomInt(0, charset.length)]);

  const required = [
    ...pick(UPPERCASE, 3),
    ...pick(LOWERCASE, 3),
    ...pick(DIGITS, 3),
    ...pick(SYMBOLS, 3),
    ...pick(ALL, 12),
  ];

  for (let i = required.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join("");
};
