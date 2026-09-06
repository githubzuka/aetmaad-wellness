import cron from 'node-cron';
import Shop from '../models/Shop.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

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

/**
 * Initialize all automated cron jobs
 */
export const initCronJobs = () => {
  // Schedule to run every Sunday at 00:00 (Midnight)
  cron.schedule('0 0 * * 0', async () => {
    console.log('[CRON SCHEDULE] Running weekly stale shop checker...');
    await checkStaleShops();
  });

  console.log('[CRON] Weekly stale shop reminder job initialized (Runs every Sunday at 00:00)');
};
