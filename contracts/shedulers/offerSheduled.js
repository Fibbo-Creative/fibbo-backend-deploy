import CronJob from "node-cron";
import {
  createNotification,
  getNotification,
} from "../../utils/notifications.js";
import { deleteOffer, getOffers } from "../../utils/offers.js";
import { getMarketContract } from "../index.js";

export const checkOffersSheduled = CronJob.schedule("* * * * *", async () => {
  let MARKET_CONTRACT = await getMarketContract();
  let offers = await getOffers();
  await Promise.all(
    offers.map(async (offer) => {
      try {
        const now = new Date().getTime();
        const deadline = offer.deadline * 1000;
        if (now > deadline) {
          let cleanOfferTx = await MARKET_CONTRACT.cleanOffers(
            offer.collectionAddress,
            offer.tokenId,
            offer.creator
          );
          await cleanOfferTx.wait();
          await deleteOffer(
            offer.collectionAddress,
            offer.tokenId,
            offer.creator
          );

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
          console.log("ALLDONE");
        }
      } catch (e) {
        console.log(e);
      }
    })
  );
});
