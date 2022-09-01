import Notifications from "../models/notifications.js";

export const createNotification = async (doc) => {
  const created = await Notifications.create(doc);
  return created;
};

export const getAllNotifications = async (wallet) => {
  const notifications = await Notifications.find({
    to: wallet,
  }).sort({ timestamp: -1 });
  return notifications;
};

export const getNotification = async (filter) => {
  const notifications = await Notifications.findOne(filter);
  return notifications;
};

export const deleteNotification = async (notificationId) => {
  const notifications = await Notifications.deleteOne({
    _id: notificationId,
  });
  return notifications;
};

export const setNotificationNoVisible = async (notificationId) => {
  const updated = await Notifications.updateOne(
    {
      _id: notificationId,
    },
    {
      visible: false,
    }
  );
  return updated;
};
