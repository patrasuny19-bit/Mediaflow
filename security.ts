import dns from "node:dns/promises";
import net from "node:net";

const privateRanges = [
  /^127\./, /^10\./, /^192\.168\./, /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./, /^0\./, /^::1$/, /^fc/i, /^fd/i, /^fe80:/i
];

export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip) || net.isIPv6(ip)) return privateRanges.some(r => r.test(ip));
  return true;
}

export async function assertSafeUrl(raw: string, allowedHosts: string[]): Promise<URL> {
  const u = new URL(raw);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only HTTP(S) URLs are supported.");
  const hostname = u.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) throw new Error("Local URLs are not allowed.");
  if (net.isIP(hostname) && isPrivateIp(hostname)) throw new Error("Private/internal addresses are not allowed.");
  const allowed = allowedHosts.some(h => hostname === h || hostname.endsWith("." + h));
  if (!allowed) throw new Error("This source isn't currently supported.");
  const records = await dns.lookup(hostname, { all: true });
  if (records.some(r => isPrivateIp(r.address))) throw new Error("Private/internal destinations are not allowed.");
  return u;
}
