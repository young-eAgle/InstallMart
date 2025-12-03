import cron from 'node-cron';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { sendEmail } from './mailer.js';

// Helper function to get date objects for scheduling
const getDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  threeDaysFromNow.setHours(23, 59, 59, 999);

  return { today, threeDaysFromNow };
};

// Send payment reminders for upcoming installments (3 days before due date)
async function sendPaymentReminders() {
  console.log('[Scheduler] Running payment reminder task at', new Date().toISOString());

  const { today, threeDaysFromNow } = getDates();

  try {
    // Find orders with installments due in the next 3 days
    const orders = await Order.find({
      'installments': {
        $elemMatch: {
          dueDate: { $gte: today, $lte: threeDaysFromNow },
          status: 'pending'
        }
      }
    }).populate('user');

    console.log(`[Scheduler] Found ${orders.length} orders with upcoming installments`);

    let emailsSent = 0;
    let emailsFailed = 0;

    // For each order, find the relevant installments and send reminders
    for (const order of orders) {
      const user = order.user;
      if (!user || !user.email) {
        console.log(`[Scheduler] Skipping order ${order.id} - user not found or email missing`);
        continue;
      }

      // Filter installments due in the next 3 days
      const upcomingInstallments = order.installments.filter(
        inst => inst.status === 'pending' &&
               inst.dueDate >= today &&
               inst.dueDate <= threeDaysFromNow
      );

      // Send reminder for each upcoming installment
      for (const installment of upcomingInstallments) {
        try {
          await sendEmail(user.email, 'paymentReminder', {
            user,
            installment,
            order
          });
          emailsSent++;
          console.log(`[Scheduler] ✓ Reminder sent to ${user.email} for order ${order.id}`);
        } catch (error) {
          emailsFailed++;
          console.error(`[Scheduler] ✗ Failed to send reminder to ${user.email}:`, error.message);
        }
      }
    }

    console.log(`[Scheduler] Payment reminders completed. Sent: ${emailsSent}, Failed: ${emailsFailed}`);
  } catch (error) {
    console.error(`[Scheduler] Error in reminder task:`, error);
  }
}

// Mark overdue installments
async function markOverdueInstallments() {
  console.log('[Scheduler] Running overdue installments task at', new Date().toISOString());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Find all orders with pending installments that are now overdue
    const orders = await Order.find({
      'installments': {
        $elemMatch: {
          dueDate: { $lt: today },
          status: 'pending'
        }
      }
    });

    let updatedCount = 0;

    for (const order of orders) {
      let modified = false;

      // Update each overdue installment
      order.installments.forEach(installment => {
        if (installment.status === 'pending' && installment.dueDate < today) {
          installment.status = 'overdue';
          modified = true;
          updatedCount++;
        }
      });

      // Update next due date
      if (modified) {
        const nextPending = order.installments.find(inst => inst.status === 'pending');
        order.nextDueDate = nextPending ? nextPending.dueDate : null;
        await order.save();
      }
    }

    console.log(`[Scheduler] Marked ${updatedCount} installments as overdue across ${orders.length} orders`);
  } catch (error) {
    console.error(`[Scheduler] Error marking overdue installments:`, error);
  }
}

// Send daily summary to admin (optional)
async function sendAdminDailySummary() {
  console.log('[Scheduler] Generating admin daily summary at', new Date().toISOString());

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get today's orders
    const todaysOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get overdue installments
    const overdueCount = await Order.aggregate([
      { $unwind: '$installments' },
      { $match: { 'installments.status': 'overdue' } },
      { $count: 'total' }
    ]);

    // Get pending payments for today
    const todaysDue = await Order.aggregate([
      { $unwind: '$installments' },
      {
        $match: {
          'installments.status': 'pending',
          'installments.dueDate': { $gte: today, $lt: tomorrow }
        }
      },
      { $count: 'total' }
    ]);

    console.log('[Scheduler] Daily Summary:');
    console.log(`  - New orders today: ${todaysOrders}`);
    console.log(`  - Overdue installments: ${overdueCount[0]?.total || 0}`);
    console.log(`  - Payments due today: ${todaysDue[0]?.total || 0}`);

    // You can extend this to send email to admin
  } catch (error) {
    console.error('[Scheduler] Error generating daily summary:', error);
  }
}

// Initialize and start all scheduled tasks
export function initScheduler() {
  console.log('[Scheduler] Initializing task scheduler...');

  // Run payment reminders daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    sendPaymentReminders();
  }, {
    timezone: "Asia/Karachi" // Adjust to your timezone
  });

  // Check for overdue installments daily at 00:01 AM
  cron.schedule('1 0 * * *', () => {
    markOverdueInstallments();
  }, {
    timezone: "Asia/Karachi"
  });

  // Send admin summary daily at 8:00 PM
  cron.schedule('0 20 * * *', () => {
    sendAdminDailySummary();
  }, {
    timezone: "Asia/Karachi"
  });

  console.log('[Scheduler] ✓ Task scheduler initialized successfully');
  console.log('[Scheduler] • Payment reminders: Daily at 9:00 AM');
  console.log('[Scheduler] • Overdue checks: Daily at 12:01 AM');
  console.log('[Scheduler] • Admin summary: Daily at 8:00 PM');

  // Optional: Run immediately on startup for testing
  // Uncomment these lines to test the scheduler on server start
  // setTimeout(() => {
  //   console.log('[Scheduler] Running initial test tasks...');
  //   markOverdueInstallments();
  // }, 5000);
}

// Export individual functions for manual testing
export { sendPaymentReminders, markOverdueInstallments, sendAdminDailySummary };
