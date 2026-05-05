export function mailTo(
  email: string,
  options?: {
    subject?: string;
    body?: string;
  },
): string {
  const params: string[] = [];

  if (options?.subject) {
    params.push(`subject=${encodeURIComponent(options.subject)}`);
  }

  if (options?.body) {
    params.push(`body=${encodeURIComponent(options.body)}`);
  }

  const query = params.join("&");

  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}