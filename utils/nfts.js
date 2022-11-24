import { formatEther } from "ethers/lib/utils.js";
import {
  ADDRESS_ZERO,
  getAuctionContract,
  getMarketContract,
} from "../contracts/index.js";
import Nft from "../models/nft.js";
import { getAuction } from "./auctions.js";
import { getCollectionInfo } from "./collections.js";
import { getFavoriteItemForToken } from "./favoriteItem.js";
import { getNftForSaleById } from "./nftsForSale.js";
import { getItemOffers, sortHigherOffer } from "./offers.js";
import { getPayTokenInfo, getPayTokens } from "./payTokens.js";

export const createNft = async (doc) => {
  const _nftCreated = await Nft.create(doc);
  if (_nftCreated) {
    return _nftCreated._doc;
  }
};

export const deleteNftItem = async (collection, tokenId) => {
  const _nftDeleted = await Nft.deleteOne({
    collectionAddress: collection,
    tokenId: tokenId,
  });

  return _nftDeleted;
};

export const getNftInfo = async (owner, nftId, collectionAddress) => {
  const _nft = await Nft.findOne({
    collectionAddress: collectionAddress,
    owner: owner,
    tokenId: nftId,
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

export const changeNftInfo = async (
  collectionAddress,
  nftId,
  name,
  desc,
  royalties,
  sanityFileURL,
  ipfsImage,
  ipfsMetadata,
  externalLink,
  additionalContent,
  categories,
  contentType,
  sanityAnimatedURL
) => {
  let updated;
  if (contentType === "AUDIO") {
    updated = await Nft.updateOne(
      { tokenId: nftId, collectionAddress: collectionAddress },
      {
        name: name,
        description: desc,
        royalty: royalties,
        image: sanityFileURL,
        ipfsImage: ipfsImage,
        ipfsMetadata: ipfsMetadata,
        externalLink: externalLink,
        additionalContent: additionalContent,
        categories: categories,
        audio: sanityAnimatedURL,
      }
    );
  }
  if (contentType === "VIDEO") {
    updated = await Nft.updateOne(
      { tokenId: nftId, collectionAddress: collectionAddress },
      {
        name: name,
        description: desc,
        royalty: royalties,
        ipfsImage: ipfsImage,
        image: sanityFileURL,
        ipfsMetadata: ipfsMetadata,
        externalLink: externalLink,
        additionalContent: additionalContent,
        categories: categories,
        video: sanityAnimatedURL,
      }
    );
  }
  if (contentType === "IMG") {
    updated = await Nft.updateOne(
      { tokenId: nftId, collectionAddress: collectionAddress },
      {
        name: name,
        description: desc,
        royalty: royalties,
        ipfsImage: ipfsImage,
        ipfsMetadata: ipfsMetadata,
        externalLink: externalLink,
        additionalContent: additionalContent,
        categories: categories,
        image: sanityFileURL,
      }
    );
  }

  return updated;
};

export const setFreezedMetadata = async (creator, collectionAddress, nftId) => {
  const updatedNft = await Nft.updateOne(
    { tokenId: nftId, collectionAddress: collectionAddress, creator: creator },
    {
      hasFreezedMetadata: true,
    }
  );

  return updatedNft;
};

export const filterItemsByTitle = async (filterQuery) => {
  const titleFilteredItems = await Nft.find({
    name: { $regex: ".*" + filterQuery + ".*", $options: "i" },
  });

  return titleFilteredItems;
};

export const getAllNftsInfo = async (nfts, user) => {
  try {
    let finalResult = [];
    const AUCTION_CONTRACT = await getAuctionContract();
    const MARKET_CONTRACT = await getMarketContract();

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
          //const createdAt = auctionInDb._id.getTimestamp();
          const createdAt = 0;

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
                createdAt: createdAt,
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
                createdAt: createdAt,
              },
            };
          }
        } else {
          //Check if its for sale
          let listingInfo = await MARKET_CONTRACT.listings(
            item.collectionAddress,
            item.tokenId,
            item.owner
          );

          listingInfo = {
            payToken: listingInfo.payToken,
            price: parseFloat(formatEther(listingInfo.price)),
            startingTime: new Date(
              listingInfo.startingTime * 1000
            ).toLocaleString(),
          };

          if (listingInfo.price !== 0) {
            let payTokenInfo = await getPayTokenInfo(listingInfo.payToken);
            result = {
              ...result,
              forSaleAt: listingInfo.startingTime,
              price: listingInfo.price,
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
        let favoritesItem = await getFavoriteItemForToken(
          item.collectionAddress,
          item.tokenId
        );

        result = {
          ...result,
          favorites: favoritesItem.length,
        };
        let favorited = favoritesItem.find((fav) => fav.for === user);
        if (favorited) {
          result = {
            ...result,
            isFavorited: true,
          };
        }
        finalResult.push(result);
      })
    );

    return finalResult;
  } catch (e) {
    console.log(e);
  }
};
