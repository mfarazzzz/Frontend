/**
 * ip-anonymize.ts — IP address anonymization for ad tracking.
 *
 * IPv4: zeroes the last octet (e.g., 192.168.1.100 → 192.168.1.0)
 * IPv6: zeroes the last 80 bits (keeps first 48 bits)
 */

/**
 * Anonymize an IP address by zeroing trailing bits.
 * Returns the anonymized IP string, or empty string if input is invalid.
 */
export function anonymizeIp(ip: string | null | undefined): string {
  if (!ip) return '';

  const trimmed = ip.trim();
  if (!trimmed) return '';

  // IPv4: zero last octet
  if (isIPv4(trimmed)) {
    const parts = trimmed.split('.');
    if (parts.length !== 4) return '';
    parts[3] = '0';
    return parts.join('.');
  }

  // IPv6: zero last 80 bits (keep first 48 bits = first 3 groups)
  if (isIPv6(trimmed)) {
    return anonymizeIPv6(trimmed);
  }

  // Unrecognized format
  return '';
}

function isIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
}

function isIPv6(ip: string): boolean {
  // Basic check: contains colons, possibly with :: shorthand
  return ip.includes(':');
}

function anonymizeIPv6(ip: string): string {
  // Expand :: shorthand to full form
  const expanded = expandIPv6(ip);
  if (!expanded) return '';

  const groups = expanded.split(':');
  if (groups.length !== 8) return '';

  // Keep first 3 groups (48 bits), zero the rest (80 bits)
  const anonymized = [
    ...groups.slice(0, 3),
    '0000',
    '0000',
    '0000',
    '0000',
    '0000',
  ];

  // Compress back to shortened form
  return compressIPv6(anonymized.join(':'));
}

function expandIPv6(ip: string): string | null {
  // Handle IPv4-mapped IPv6 (::ffff:192.168.1.1)
  if (ip.includes('.')) {
    const lastColon = ip.lastIndexOf(':');
    const ipv4Part = ip.substring(lastColon + 1);
    const ipv6Part = ip.substring(0, lastColon);
    const ipv4Parts = ipv4Part.split('.');
    if (ipv4Parts.length !== 4) return null;
    const hex1 = ((parseInt(ipv4Parts[0]) << 8) | parseInt(ipv4Parts[1]))
      .toString(16)
      .padStart(4, '0');
    const hex2 = ((parseInt(ipv4Parts[2]) << 8) | parseInt(ipv4Parts[3]))
      .toString(16)
      .padStart(4, '0');
    return expandIPv6(`${ipv6Part}:${hex1}:${hex2}`);
  }

  if (ip.includes('::')) {
    const [left, right] = ip.split('::');
    const leftGroups = left ? left.split(':') : [];
    const rightGroups = right ? right.split(':') : [];
    const missing = 8 - leftGroups.length - rightGroups.length;
    if (missing < 0) return null;
    const fill = Array(missing).fill('0000');
    const all = [...leftGroups, ...fill, ...rightGroups];
    return all.map((g) => g.padStart(4, '0')).join(':');
  }

  const groups = ip.split(':');
  if (groups.length !== 8) return null;
  return groups.map((g) => g.padStart(4, '0')).join(':');
}

function compressIPv6(expanded: string): string {
  const groups = expanded.split(':').map((g) => g.replace(/^0+/, '') || '0');

  // Find longest run of all-zero groups for :: compression
  let bestStart = -1,
    bestLen = 0,
    curStart = -1,
    curLen = 0;
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen >= 2) {
    const before = groups.slice(0, bestStart).join(':');
    const after = groups.slice(bestStart + bestLen).join(':');
    return `${before}::${after}`;
  }

  return groups.join(':');
}
