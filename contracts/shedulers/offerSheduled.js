import CronJob from "node-cron";
import {
  createNotification,
  getNotification,
} from "../../utils/notifications.js";
import { getOffers } from "../../utils/offers.js";

export const checkOffersSheduled = CronJob.schedule("* * * * *", async () => {
  let offers = await getOffers();
  await Promise.all(
    offers.map(async (offer) => {
      const now = new Date().getTime();
      const deadline = offer.deadline * 1000;
      if (now > deadline) {
        const hasNotification = await getNotification({
          collectionAddress: offer.collectionAddress,
          tokenId: offer.tokenId,
          to: offer.creatoroffer.creator,
          params: { type: "EXPIRED" },
        });
        if (hasNotification) {
        } else {
          //Enviar notificación de que ha expirado
          const notificationDoc = {
            type: "OFFER",
            collectionAddress: offer.collectionAddress,
            tokenId: offer.tokenId,
            to: offer.creator,
            timestamp: new Date().toISOString(),
            params: {
              type: "EXPIRED",
            },
            visible: true,
          };
          await createNotification(notificationDoc);
        }
      } else {
      }
    })
  );
});
