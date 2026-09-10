import cron from 'node-cron';
import Shop from '../models/Shop.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Event from '../models/Event.js';

/**
 * Check for shops not updated within the last 7 days and notify volunteers
 */
export const checkStaleShops = async () => {
  try {
    console.log('[CRON JOB] Starting check for stale shops (not updated in 7+ days)...');
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const staleShops = await Shop.find({
      isActive: true,
      lastUpdated: { $lt: sevenDaysAgo },
    }).populate('volunteer', '_id name email city');

    console.log(`[CRON JOB] Found ${staleShops.length} stale shop(s).`);

    let notificationsCreated = 0;

    for (const shop of staleShops) {
      let targetVolunteers = [];

      if (shop.volunteer) {
        targetVolunteers.push(shop.volunteer._id);
      } else {
        // If no direct volunteer is assigned, notify approved volunteers in the same city
        const cityVolunteers = await User.find({
          role: 'volunteer',
          status: 'approved',
          city: new RegExp(shop.city, 'i'),
        }).select('_id');
        targetVolunteers = cityVolunteers.map((v) => v._id);
      }

      for (const volunteerId of targetVolunteers) {
        // Avoid duplicate notification if unread reminder already exists within last 24h
        const existingNotif = await Notification.findOne({
          user: volunteerId,
          title: 'Weekly Shop Update Reminder',
          message: { $regex: shop.name },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (!existingNotif) {
          await Notification.create({
            user: volunteerId,
            title: 'Weekly Shop Update Reminder',
            message: `Reminder: Shop '${shop.name}' (${shop.city}) has not been updated in over 7 days. Volunteer ko har week update karna hoga.`,
          });
          notificationsCreated++;
        }
      }
    }

    console.log(`[CRON JOB] Created ${notificationsCreated} notification reminder(s) for stale shops.`);
  } catch (error) {
    console.error('[CRON JOB ERROR]:', error.message);
  }
};

/** Notify approved volunteers about events happening within the next 7 days. */
export const checkUpcomingEvents = async () => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [events, volunteers] = await Promise.all([
      Event.find({ status: 'approved', date: { $gte: now, $lte: sevenDaysFromNow } }),
      User.find({ role: 'volunteer', status: 'approved' }).select('_id'),
    ]);

    let notificationsCreated = 0;
    for (const event of events) {
      for (const volunteer of volunteers) {
        const existingNotification = await Notification.findOne({
          user: volunteer._id,
          type: 'event_upcoming',
          referenceId: event._id,
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        });

        if (!existingNotification) {
          await Notification.create({
            user: volunteer._id,
            title: 'ASHVA Event Coming Soon',
            message: `${event.title} is coming up on ${new Date(event.date).toLocaleDateString('en-IN')} at ${event.location}.`,
            type: 'event_upcoming',
            referenceId: event._id,
            metadata: { eventId: event._id, city: event.city },
          });
          notificationsCreated++;
        }
      }
    }

    console.log(`[CRON JOB] Created ${notificationsCreated} upcoming event notification(s).`);
  } catch (error) {
    console.error('[CRON EVENT ERROR]:', error.message);
  }
};

/**
 * Initialize all automated cron jobs
 */
export const initCronJobs = () => {
  // Schedule to run every Sunday at 00:00 (Midnight)
  cron.schedule('0 0 * * 0', async () => {
    console.log('[CRON SCHEDULE] Running weekly stale shop checker...');
    await checkStaleShops();
  });

  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON SCHEDULE] Running upcoming event reminder checker...');
    await checkUpcomingEvents();
  });

  console.log('[CRON] Reminder jobs initialized: shops weekly, events daily at 09:00');
};
