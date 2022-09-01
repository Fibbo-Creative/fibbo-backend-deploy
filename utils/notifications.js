import Notifications from "../models/notifications.js";

export const createNotification = async (doc) => {
  const created = await Notifications.create(doc);
  return created;
};

export const getAllNotifications = async (wallet) => {
  const notifications = await Notifications.find({
    to: wallet,
  }).sort({});
  return notifications;
};
