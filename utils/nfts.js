import { formatEther } from "ethers/lib/utils.js";
import { ADDRESS_ZERO, AUCTION_CONTRACT } from "../contracts/index.js";
import Nft from "../models/nft.js";
import { getCollectionInfo } from "./collections.js";
import { getNftForSaleById } from "./nftsForSale.js";
import { getItemOffers, sortHigherOffer } from "./offers.js";
import { getPayTokenInfo, getPayTokens } from "./payTokens.js";

export const createNft = async (doc) => {
  const _nftCreated = await Nft.create(doc);
  if (_nftCreated) {
    return _nftCreated._doc;
  }
};

export const getNftInfo = async (owner, nftId, collectionAddress) => {
  const _nft = await Nft.findOne({
    owner: owner,
    tokenId: nftId,
    collectionAddress: collectionAddress,
  });

  if (_nft) return _nft._doc;
};

export const getAllNfts = async (count) => {
  const allNfts = await Nft.find();

  return count ? allNfts.slice(0, count) : allNfts;
};

export const getNftInfoById = async (nftId, collectionAddress) => {
  const _nft = await Nft.findOne({
    collectionAddress: collectionAddress,
    tokenId: nftId,
  });
  if (_nft) return _nft._doc;
};

export const getNftsByAddress = async (ownerAddress) => {
  const allNfts = await Nft.find({ owner: ownerAddress });
  return allNfts;
};

export const getNftsByCreator = async (creatorAddress) => {
  const allNfts = await Nft.find({ creator: creatorAddress });
  return allNfts;
};

export const changeNftOwner = async (
  collectionAddress,
  nftId,
  prevOwner,
  newOwner
) => {
  const updatedNft = await Nft.updateOne(
    { tokenId: nftId, collectionAddress: collectionAddress, owner: prevOwner },
    { owner: newOwner }
  );

  return updatedNft;
};

export const filterItemsByTitle = async (filterQuery) => {
  const titleFilteredItems = await Nft.find({
    name: { $regex: ".*" + filterQuery + ".*", $options: "i" },
  });

  return titleFilteredItems;
};

export const getAllNftsInfo = async (nfts) => {
  try {
    let finalResult = [];

    await Promise.all(
      nfts.map(async (item) => {
        //Get collection info
        let result = {};
        let collectionInfo = await getCollectionInfo(item.collectionAddress);
        //Check if has auction

        result = {
          ...item._doc,
          collection: collectionInfo,
        };
        let auction = await AUCTION_CONTRACT.auctions(
          item.collectionAddress,
          item.tokenId
        );
        if (auction.owner !== ADDRESS_ZERO) {
          let payTokenInfo = await getPayTokenInfo(auction.payToken);
          let highestBid = await AUCTION_CONTRACT.highestBids(
            item.collectionAddress,
            item.tokenId
          );
          if (highestBid.bidder !== ADDRESS_ZERO) {
            result = {
              ...result,
              auction: {
                topBid: parseFloat(formatEther(highestBid.bid)),
                startTime: auction.startTime.toNumber() * 1000,
                endTime: auction.endTime.toNumber(),
                payToken: payTokenInfo._doc,
              },
            };
          } else {
            result = {
              ...result,
              auction: {
                bid: parseFloat(formatEther(auction.minBid)),
                startTime: auction.startTime.toNumber(),
                endTime: auction.endTime.toNumber(),
                payToken: payTokenInfo._doc,
              },
            };
          }
        } else {
          //Check if its for sale
          let listing = await getNftForSaleById(
            item.collectionAddress,
            item.tokenId
          );
          if (listing) {
            let payTokenInfo = await getPayTokenInfo(listing.payToken);
            result = {
              ...result,
              forSaleAt: listing.forSaleAt,
              price: listing.price,
              payToken: payTokenInfo._doc,
            };
          } else {
            //Check if it has offers
            let offers = await getItemOffers(
              item.collectionAddress,
              item.tokenId
            );
            if (offers.length > 0) {
              let higherOffer;
              if (offers.length === 1) {
                higherOffer = offers[0];
              } else {
                let higherOffers = offers.sort(sortHigherOffer);

                higherOffer = higherOffers[0];
              }

              let payTokenInfo = await getPayTokenInfo(higherOffer.payToken);

              result = {
                ...result,
                offer: { ...higherOffer._doc, payToken: payTokenInfo },
              };
            }
          }
        }

        finalResult.push(result);
      })
    );

    return finalResult;
  } catch (e) {
    console.log(e);
  }
};
