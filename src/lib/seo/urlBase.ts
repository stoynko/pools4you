export function getSiteBaseUrl(site: URL | undefined): string {
  return (site?.toString() || "http://localhost:4321").replace(/\/$/, "");
}

export function toAbsoluteUrl(url: string, baseUrl: string): string {
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
}