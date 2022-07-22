import { formatEther } from "ethers/lib/utils.js";
import { addNewAuction } from "../../utils/auctions.js";
import { AUCTION_CONTRACT } from "../index.js";

export const listenToAuctionEvents = () => {
  AUCTION_CONTRACT.on(
    "AuctionCreated",
    async (collection, tokenId, payToken) => {
      const auctionInfo = await AUCTION_CONTRACT.getAuction(
        collection,
        tokenId
      );

      console.log(auctionInfo);

      const doc = {
        collectionAddress: collection,
        tokenId: tokenId,
        payToken: payToken,
        reservePrice: formatEther(auctionInfo._reservePrice),
        startTime: auctionInfo._startTime,
        endTime: auctionInfo._endTime,
      };

      await addNewAuction(doc);
    }
  );
};
