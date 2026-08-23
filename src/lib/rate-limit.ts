const rateLimit = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { windowMs: 60_000, max: 10 }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1 };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: config.max - entry.count };
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimit) {
      if (now > entry.resetTime) {
        rateLimit.delete(key);
      }
    }
  }, 60_000);
}
