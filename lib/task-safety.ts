const prohibitedPatterns = [
  /\b(weapon|firearm|ammunition|explosive)\b/i,
  /\b(illegal drug|narcotic|controlled substance)\b/i,
  /\b(alcohol|cigarette|vape|nicotine)\b/i,
  /\b(betting|gambling|casino)\b/i,
  /\b(pornography|sexual service)\b/i,
  /\b(fake id|forged document|stolen goods)\b/i,
];

export function checkTaskSafety(title: string, description: string) {
  const text = `${title}\n${description}`;
  const prohibited = prohibitedPatterns.some((pattern) => pattern.test(text));
  return prohibited
    ? { allowed: false as const, reason: 'This task is not allowed under UMUNOTA marketplace safety rules.' }
    : { allowed: true as const };
}
