import User from '../models/User.js';
import Notification from '../models/Notification.js';
import generateToken from '../utils/generateToken.js';
import { logSecurityEvent } from '../utils/securityLog.js';
import { createNotificationDeduped } from './notificationController.js';

/** Failed attempts allowed before the password field is locked out. */
export const LOCKOUT_THRESHOLD = 5;

/** Count failed login events for one account in the last 15 minutes. */
const countRecentFailures = async (userId) => {
  const alerts = await Notification.find({
    type: 'security',
    'metadata.kind': 'failed_login',
    'metadata.userId': userId,
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
  })
    .select('repeatCount metadata')
    .lean();

  // Repeated identical attempts are collapsed into one document, so the true
  // attempt count is the sum of repeatCount (not the number of documents).
  return alerts.reduce((total, alert) => {
    const repeats = alert.repeatCount || 1;
    const attempts = alert.metadata?.attempts || 1;
    // The first alert records how many attempts preceded it; later collapsed
    // repeats each represent one further attempt.
    return total + (repeats > 1 ? repeats : attempts);
  }, 0);
};

/**
 * @desc    Register a new user (Customer, Volunteer, or Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber, address, city, role } = req.body;

    if (!name || !email || !password || !contactNumber || !city) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password, contactNumber, city' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'An account already exists with this email. Please sign in instead.' });
    }

    const userRole = role && ['admin', 'volunteer', 'customer'].includes(role) ? role : 'customer';
    const initialStatus = userRole === 'volunteer' ? 'pending' : 'approved';

    const user = await User.create({
      name,
      email,
      password,
      contactNumber,
      address: address || '',
      city,
      role: userRole,
      status: initialStatus,
    });

    if (user) {
      // Notify admins about a brand-new volunteer application so the admin
      // notification panel reflects real activity.
      if (user.role === 'volunteer') {
        try {
          await Notification.create({
            user: null,
            title: 'New Volunteer Application',
            message: `${user.name} registered as a volunteer for the ${user.city} zone and is awaiting approval.`,
            type: 'volunteer_application',
            referenceId: user._id,
            metadata: { volunteerId: user._id, city: user.city },
          });
        } catch (notificationError) {
          console.error('Volunteer registration notification failed:', notificationError.message);
        }
      }

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          address: user.address,
          city: user.city,
          role: user.role,
          status: user.status,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Unknown account — log for the admin security feed. Identical repeats
      // collapse into one alert instead of flooding the feed.
      await createNotificationDeduped({
        user: null,
        type: 'security',
        title: 'Failed Login Attempt',
        message: `Login attempted for an unknown email from ${req.ip}.`,
        metadata: {
          severity: 'low',
          kind: 'failed_login',
          identifier: req.ip,
          email: String(email).toLowerCase(),
        },
      });
      return res.status(404).json({ message: 'No account found with this email. Please create an account first.' });
    }

    // Lock the password field after too many recent failures on this account
    const priorFailures = await countRecentFailures(user._id);
    if (priorFailures >= LOCKOUT_THRESHOLD) {
      return res.status(429).json({
        code: 'PASSWORD_LOCKED',
        message: `Too many failed attempts. For security, please reset your password or contact the administrator.`,
      });
    }

    if (await user.matchPassword(password)) {
      // Role isolation: a portal may only be used by its own role.
      // - The Admin Console requires role 'admin'.
      // - The customer storefront login is for customers and volunteers,
      //   never an administrator.
      const expected = String(expectedRole || '').toLowerCase();
      if (expected === 'admin' && user.role !== 'admin') {
        return res.status(403).json({
          code: 'ROLE_MISMATCH',
          message: 'This portal is for administrators only. Please sign in from the correct login page.',
        });
      }
      if (expected === 'customer' && user.role === 'admin') {
        return res.status(403).json({
          code: 'ROLE_MISMATCH',
          message: 'Administrator accounts must sign in through the Admin Console.',
        });
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          address: user.address,
          city: user.city,
          role: user.role,
          status: user.status,
          token: generateToken(user._id),
        },
      });
    } else {
      // Wrong password — surface repeated attempts to the admin security feed.
      // Identical repeats inside the dedupe window collapse into one alert.
      const recentFailures = await countRecentFailures(user._id);
      await createNotificationDeduped({
        user: null,
        type: 'security',
        title: recentFailures >= 4 ? 'Repeated Failed Logins' : 'Failed Login Attempt',
        message: recentFailures >= 4
          ? `${recentFailures + 1} failed login attempts for ${user.email} in the last 15 minutes (from ${req.ip}).`
          : `Incorrect password supplied for ${user.email} from ${req.ip}.`,
        metadata: {
          severity: recentFailures >= 4 ? 'high' : 'medium',
          kind: 'failed_login',
          identifier: req.ip,
          email: user.email,
          userId: user._id,
          attempts: recentFailures + 1,
        },
      });

      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    How many failed login attempts have been recorded for an account
 *          in the last 15 minutes (shown to the user before lockout).
 * @route   GET /api/auth/login-attempts?email=...
 * @access  Public
 */
export const getLoginAttempts = async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.json({ success: true, data: { attempts: 0 } });
    }

    const user = await User.findOne({ email }).select('_id');
    if (!user) {
      return res.json({ success: true, data: { attempts: 0 } });
    }

    const attempts = await countRecentFailures(user._id);

    res.json({
      success: true,
      data: {
        attempts,
        remaining: Math.max(0, LOCKOUT_THRESHOLD - attempts),
        locked: attempts >= LOCKOUT_THRESHOLD,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          address: user.address,
          city: user.city,
          role: user.role,
          status: user.status,
        },
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a volunteer application for an existing customer account
 * @route   POST /api/auth/apply-volunteer
 * @access  Private
 */
export const applyVolunteer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' || user.role === 'volunteer') {
      return res.status(400).json({ message: 'This account has already applied to become a volunteer.' });
    }

    const { contactNumber, city } = req.body;
    user.contactNumber = contactNumber || user.contactNumber;
    user.city = city || user.city;
    user.role = 'volunteer';
    user.status = 'pending';
    await user.save();

    await Notification.create({
      user: null,
      title: 'New Volunteer Application',
      message: `${user.name} submitted a volunteer application for the ${user.city} zone.`,
      type: 'volunteer_application',
      referenceId: user._id,
      metadata: { volunteerId: user._id, city: user.city },
    });

    res.json({
      success: true,
      message: 'Volunteer application submitted and is pending Admin approval.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        address: user.address,
        city: user.city,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      user.city = req.body.city || user.city;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          contactNumber: updatedUser.contactNumber,
          address: updatedUser.address,
          city: updatedUser.city,
          role: updatedUser.role,
          status: updatedUser.status,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request a password reset. The request is routed to the admin team,
 *          who verify identity and reset the account. Deliberately returns the
 *          same response whether or not the email exists (no account enumeration).
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email, note } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide the email address on your account.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('name email role status');

    if (user) {
      await Notification.create({
        user: null,
        title: 'Password Reset Request',
        message: `${user.name} (${user.email}, ${user.role}) requested a password reset.${note ? ` Note: "${String(note).slice(0, 300)}"` : ''}`,
        type: 'general',
        referenceId: user._id,
        metadata: {
          volunteerId: user.role === 'volunteer' ? user._id : undefined,
          userId: user._id,
          email: user.email,
          role: user.role,
          kind: 'password_reset',
          requestedIp: req.ip,
        },
      });
    } else {
      // Unknown email — still log it so admins can spot probing behaviour.
      await logSecurityEvent({
        severity: 'low',
        kind: 'password_reset_unknown',
        title: 'Password Reset For Unknown Email',
        message: `Reset requested for an email that has no account (${normalizedEmail}) from ${req.ip}.`,
        metadata: { identifier: req.ip, email: normalizedEmail },
      });
    }

    res.json({
      success: true,
      message:
        'Your request has been sent to the ASHVA admin team. They will verify your identity and help you regain access.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: reset a user's password after verifying their identity
 * @route   PATCH /api/admin/users/:id/password
 * @access  Private (Admin)
 */
export const adminResetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = String(newPassword);
    await user.save();

    // Let the affected user know their password was changed by an admin
    await Notification.create({
      user: user._id,
      title: 'Your Password Was Reset',
      message:
        'An ASHVA administrator reset your account password after verifying your identity. Please sign in and change it if needed.',
      type: 'general',
      referenceId: user._id,
      metadata: { userId: user._id },
    });

    // And record the action in the admin audit feed
    await Notification.create({
      user: null,
      title: 'Password Reset Performed',
      message: `${req.user.name || 'Admin'} reset the password for ${user.email}.`,
      type: 'general',
      referenceId: user._id,
      metadata: { userId: user._id, email: user.email, kind: 'password_reset_done' },
    });

    res.json({ success: true, message: `Password updated for ${user.email}.` });
  } catch (error) {
    next(error);
  }
};
