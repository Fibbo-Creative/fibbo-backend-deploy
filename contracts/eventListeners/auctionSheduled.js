import { formatEther } from "ethers/lib/utils.js";
import CronJob from "node-cron";
import { getAuctions } from "../../utils/auctions.js";
import {
  ADDRESS_ZERO,
  AUCTION_CONTRACT,
  COLLECTION_CONTRACT,
  managerWallet,
  WFTM_CONTRACT,
} from "../index.js";

const scheduledJobFunction = CronJob.schedule("* * * * *", async () => {
  const auctions = await getAuctions();
  await Promise.all(
    auctions.map(async (auction) => {
      const now = new Date().getTime();
      const startTime = auction.startTime * 1000;
      const endTime = auction.endTime * 1000;
      console.log("DOING");
      if (now > startTime) {
        if (now > endTime) {
          try {
            const highestBider = await AUCTION_CONTRACT.getHighestBidder(
              auction.collectionAddress,
              auction.tokenId
            );
            if (highestBider._bidder !== ADDRESS_ZERO) {
              const reservePrice = auction.reservePrice;
              const bid = highestBider._bid;
              if (formatEther(bid) < reservePrice) {
                const clearAuctionTx = await AUCTION_CONTRACT.clearAuction(
                  auction.collectionAddress,
                  auction.tokenId
                );
                await clearAuctionTx.wait();
              } else {
                const isApprovedForAll =
                  await COLLECTION_CONTRACT.isApprovedForAll(
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

                const resolveTx = await AUCTION_CONTRACT.resultAuction(
                  auction.collectionAddress,
                  auction.tokenId
                );

                await resolveTx.wait();
              }
            } else {
              const clearAuctionTx = AUCTION_CONTRACT.clearAuction(
                auction.collectionAddress,
                auction.tokenId
              );
              await clearAuctionTx.wait();
            }
          } catch (e) {
            console.log(e);
          }
        } else {
        }
      } else {
      }
    })
  );
});

const initScheduledJobs = () => {
  scheduledJobFunction.start();
};

export default initScheduledJobs;
