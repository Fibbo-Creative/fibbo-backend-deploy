import CronJob from "node-cron";
import { getAuctions } from "../../utils/auctions.js";
import {
  AUCTION_CONTRACT,
  COLLECTION_CONTRACT,
  managerWallet,
  WFTM_CONTRACT,
} from "../index.js";

const scheduledJobFunction = CronJob.schedule("* * * * *", async () => {
  const auctions = await getAuctions();
  console.log("======");
  await Promise.all(
    auctions.map(async (auction) => {
      const now = new Date().getTime();
      const startTime = auction.startTime * 1000;
      const endTime = auction.endTime * 1000;

      if (now > startTime) {
        if (now > endTime) {
          console.log("auction has ended");

          try {
            const highestBider = await AUCTION_CONTRACT.getHighestBidder(
              auction.collectionAddress,
              auction.tokenId
            );

            const bid = highestBider._bid;

            const isApprovedForAll = await COLLECTION_CONTRACT.isApprovedForAll(
              managerWallet.address,
              AUCTION_CONTRACT.address
            );

            if (!isApprovedForAll) {
              const approveTx = await COLLECTION_CONTRACT.setApprovalForAll(
                AUCTION_CONTRACT.address,
                true
              );
              await approveTx.wait();
            }

            const allowance = await WFTM_CONTRACT.allowance(
              managerWallet.address,
              AUCTION_CONTRACT.address
            );

            if (allowance.lt(bid)) {
              const tx = await WFTM_CONTRACT.approve(
                AUCTION_CONTRACT.address,
                bid
              );
              await tx.wait();
            }

            console.log("RESOLVING");

            const resolveTx = await AUCTION_CONTRACT.resultAuction(
              auction.collectionAddress,
              auction.tokenId
            );

            await resolveTx.wait();
            console.log("Resolved!");
          } catch (e) {
            console.log(e);
          }
        } else {
          console.log("Auction has not finished");
        }
      } else {
        console.log("Auction has not started");
      }
    })
  );
});

const initScheduledJobs = () => {
  scheduledJobFunction.start();
};

export default initScheduledJobs;
