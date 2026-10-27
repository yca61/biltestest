export function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 12) return "Parola en az 12 karakter olmalıdır.";
  if (!/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(pw) || !/\d/.test(pw)) return "Parola harf ve rakam içermelidir.";
  return null;
}
