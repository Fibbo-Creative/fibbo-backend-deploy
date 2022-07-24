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
            console.log(highestBider._bidder);
            if (highestBider._bidder !== ADDRESS_ZERO) {
              const reservePrice = auction.reservePrice;
              const bid = highestBider._bid;
              if (formatEther(bid) < reservePrice) {
                const clearAuctionTx = await AUCTION_CONTRACT.clearAuction(
                  auction.collectionAddress,
                  auction.tokenId
                );
                await clearAuctionTx.wait();
                console.log("Cleared Auction");
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

                console.log("RESOLVING");

                const resolveTx = await AUCTION_CONTRACT.resultAuction(
                  auction.collectionAddress,
                  auction.tokenId
                );

                await resolveTx.wait();
                console.log("Resolved!");
              }
            } else {
              console.log("Has no bids!");
              const clearAuctionTx = AUCTION_CONTRACT.clearAuction(
                auction.collectionAddress,
                auction.tokenId
              );
              await clearAuctionTx.wait();
              console.log("Cleared Auction");
            }
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
