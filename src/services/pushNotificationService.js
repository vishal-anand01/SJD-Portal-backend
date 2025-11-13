// backend/src/services/pushNotificationService.js
import webpush from "web-push";
import logger from "../utils/logger.js";

/**
 * 🧠 Push Notification Service
 * Handles web push notifications via VAPID keys.
 * Compatible with browser subscriptions & service workers.
 */

// Load keys from environment
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";

// Configure web-push
try {
  webpush.setVapidDetails(
    "mailto:support@sjd-portal.in",
    publicVapidKey,
    privateVapidKey
  );
} catch (err) {
  logger.warn("⚠️ VAPID keys missing or invalid — Push may not work.");
}

/**
 * ✅ Send a push notification to a single user
 * @param {Object} userId - MongoDB User ID (future link to subscription)
 * @param {String} message - Notification message text
 * @param {Object} [data] - Optional data payload
 */
export async function sendToUser(userId, message, data = {}) {
  try {
    // Placeholder: get user subscription from DB (future-ready)
    // Example: const subscription = await Notification.findOne({ userId });
    // For now, this is a stub
    logger.info(`🔔 Push notification to user ${userId}: ${message}`, data);
    return { success: true };
  } catch (err) {
    logger.error("❌ Push sendToUser failed:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 📢 Broadcast notification to multiple users
 * (can be used for DM mass alerts, emergency updates, etc.)
 */
export async function broadcast(message, data = {}) {
  try {
    logger.info(`📣 Broadcasting push: ${message}`, data);
    // Placeholder for mass push logic
    return { success: true };
  } catch (err) {
    logger.error("❌ Push broadcast failed:", err.message);
    return { success: false, error: err.message };
  }
}

// Default export for backward compatibility
export default {
  sendToUser,
  broadcast,
};
