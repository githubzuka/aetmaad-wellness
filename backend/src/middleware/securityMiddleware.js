import rateLimit from 'express-rate-limit';
import { logSecurityEvent } from '../utils/securityLog.js';

/**
 * Route-level rate limiters + malicious-activity detection.
 * Every limiter that trips writes a real 'security' notification into the
 * admin feed so administrators see abuse as it happens.
 */

const sharedHandler = (name) => async (req, res) => {
  const identifier = req.user?._id?.toString() || req.ip || 'unknown';
  await logSecurityEvent({
    severity: 'high',
    kind: name,
    title: 'Rate Limit Triggered',
    message: `Too many requests on ${name} from ${identifier} (${req.method} ${req.originalUrl}).`,
    metadata: {
      limiter: name,
      identifier,
      method: req.method,
      path: req.originalUrl,
      userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
    },
  });

  res.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  });
};

/** Strict limiter for auth endpoints — brute-force protection */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failures, so normal logins are unaffected
  handler: sharedHandler('auth_brute_force'),
});

/** Limiter for public write endpoints (contact, donations, feedback) */
export const publicWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: sharedHandler('public_write_abuse'),
});

/** General API ceiling to blunt scraping / floods */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: sharedHandler('api_flood'),
});

/**
 * Reject obvious injection / traversal attempts and alert admins.
 * Catches Mongo operators in body/query and path traversal in the URL.
 */
export const detectMaliciousInput = async (req, res, next) => {
  try {
    const suspiciousKeys = [];
    const inspect = (obj, pathPrefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('__proto__') || key.includes('constructor')) {
          suspiciousKeys.push(`${pathPrefix}${key}`);
        } else if (typeof obj[key] === 'object') {
          inspect(obj[key], `${pathPrefix}${key}.`);
        }
      }
    };
    inspect(req.body);
    inspect(req.query);

    const traversalPattern = /(\.\.\/|\.\.\\|%2e%2e|etc\/passwd|<\s*script)/i;
    const urlSuspicious = traversalPattern.test(req.originalUrl);
    const stringSuspicious = typeof req.body?.message === 'string' && /<\s*script/i.test(req.body.message);

    if (suspiciousKeys.length > 0 || urlSuspicious || stringSuspicious) {
      await logSecurityEvent({
        severity: 'critical',
        kind: 'injection_attempt',
        title: 'Malicious Input Blocked',
        message: `Suspicious request blocked from ${req.ip} on ${req.method} ${req.originalUrl}.`,
        metadata: {
          identifier: req.user?._id?.toString() || req.ip,
          suspiciousKeys,
          urlSuspicious,
          stringSuspicious,
          userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
        },
      });

      return res.status(400).json({
        success: false,
        message: 'Request rejected: the payload contained disallowed content.',
      });
    }

    return next();
  } catch (error) {
    // Never block the request because the detector itself failed, but surface
    // the failure in the server logs so it is not silently lost.
    console.error('[SECURITY DETECTOR ERROR]', error);
    return next();
  }
};

/**
 * Builds a middleware that fires a real admin alert when a specific event
 * happens (e.g. repeated unauthorised access to a protected route).
 */
export const alertOnEvent = ({ severity = 'high', kind, title, message }) =>
  async (req, res, next) => {
    await logSecurityEvent({
      severity,
      kind,
      title,
      message: typeof message === 'function' ? message(req) : message,
      metadata: {
        identifier: req.user?._id?.toString() || req.ip,
        method: req.method,
        path: req.originalUrl,
        userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
      },
    });
    next();
  };
