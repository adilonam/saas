export type CidrInfo = {
  cidr: string;
  prefix: number;
  network: string;
  broadcast: string;
  netmask: string;
  wildcard: string;
  /** IPv4 total addresses in block (≤ 2^32, safe JS integer). */
  totalAddresses: number;
  usableHosts: number;
  firstUsable: string | null;
  lastUsable: string | null;
  usableRange: string | null;
};

function ipv4ToInt(s: string): number | null {
  const parts = s.trim().split(".").map((x) => Number(x));
  if (parts.length !== 4) return null;
  if (parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
  return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0) as number;
}

export function intToIpv4(n: number): string {
  const u = n >>> 0;
  return [(u >>> 24) & 255, (u >>> 16) & 255, (u >>> 8) & 255, u & 255].join(".");
}

function maskForPrefix(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xffffffff >>> 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

export function analyzeCidr(input: string): { ok: true; info: CidrInfo } | { ok: false; error: string } {
  const raw = input.trim();
  const m = raw.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!m) {
    return { ok: false, error: "Use IPv4 CIDR form, e.g. 192.168.1.0/24." };
  }
  const ipStr = m[1]!;
  const p = Number(m[2]!);
  if (!Number.isInteger(p) || p < 0 || p > 32) {
    return { ok: false, error: "Prefix must be between 0 and 32." };
  }
  const ip = ipv4ToInt(ipStr);
  if (ip === null) {
    return { ok: false, error: "Invalid IPv4 address." };
  }
  const mask = maskForPrefix(p);
  const wildcard = (~mask >>> 0) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - p);

  let usableHosts: number;
  let firstUsable: string | null;
  let lastUsable: string | null;
  let usableRange: string | null;

  if (p === 32) {
    usableHosts = 1;
    firstUsable = intToIpv4(network);
    lastUsable = firstUsable;
    usableRange = `${firstUsable}`;
  } else if (p === 31) {
    usableHosts = 2;
    firstUsable = intToIpv4(network);
    lastUsable = intToIpv4(broadcast);
    usableRange = `${firstUsable} – ${lastUsable} (RFC 3021 point-to-point)`;
  } else if (p >= 30) {
    usableHosts = total > 2 ? total - 2 : 0;
    firstUsable = total > 2 ? intToIpv4(network + 1) : null;
    lastUsable = total > 2 ? intToIpv4(broadcast - 1) : null;
    usableRange =
      firstUsable && lastUsable ? `${firstUsable} – ${lastUsable}` : "No classic host range (/30+ often no broadcast).";
  } else {
    usableHosts = total - 2;
    firstUsable = intToIpv4(network + 1);
    lastUsable = intToIpv4(broadcast - 1);
    usableRange = `${firstUsable} – ${lastUsable}`;
  }

  return {
    ok: true,
    info: {
      cidr: `${intToIpv4(network)}/${p}`,
      prefix: p,
      network: intToIpv4(network),
      broadcast: intToIpv4(broadcast),
      netmask: intToIpv4(mask),
      wildcard: intToIpv4(wildcard),
      totalAddresses: total,
      usableHosts,
      firstUsable,
      lastUsable,
      usableRange,
    },
  };
}
