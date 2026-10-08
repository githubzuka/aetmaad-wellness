import { createNotificationDeduped } from '../controllers/notificationController.js';

/**
 * Central security-event logger.
 * Writes a real 'security' notification into the admin feed so malicious or
 * suspicious activity is surfaced to administrators immediately.
 *
 * Repeated identical events collapse into a single alert with an "×N" counter
 * (see createNotificationDeduped) so a burst of identical attempts does not
 * flood the feed.
 *
 * severity: 'low' | 'medium' | 'high' | 'critical'
 */
export const logSecurityEvent = async ({
  severity = 'medium',
  kind = 'general',
  title,
  message,
  metadata = {},
} = {}) => {
  try {
    const severityTag = String(severity).toUpperCase();
    await createNotificationDeduped({
      user: null,
      title: title || `${severityTag} SECURITY ALERT`,
      message: message || 'Suspicious activity detected.',
      type: 'security',
      referenceId: metadata.referenceId || null,
      metadata: { ...metadata, severity, kind, detectedAt: new Date().toISOString() },
    });
  } catch (error) {
    // Never let security logging break the request path
    console.error('[SECURITY LOG ERROR]', error.message);
  }
};

export default logSecurityEvent;
