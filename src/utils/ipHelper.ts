import { Request } from 'express';

/**
 * Extract client IP address from Express request
 * Handles various proxy headers and connection info
 */
export function getClientIp(req: Request): string {
  // Check various headers that proxies might set
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }

  // Check x-real-ip header (set by some proxies)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to connection info
  const remoteAddress = req.socket?.remoteAddress || 
                       (req.connection as any)?.remoteAddress ||
                       req.ip;

  // Clean IPv4-mapped IPv6 addresses (::ffff:192.168.1.1 -> 192.168.1.1)
  if (remoteAddress) {
    return remoteAddress.replace(/^::ffff:/, '');
  }

  // Last resort
  return '127.0.0.1';
}

