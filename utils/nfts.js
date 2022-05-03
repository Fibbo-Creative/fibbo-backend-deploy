import Nft from "../models/nft.js";

export const getNftInfo = async (owner, nftId, collectionAddress) => {
  const _nft = await Nft.findOne({
    owner: owner,
    itemId: nftId,
    collectionAddress: collectionAddress,
  });
  if (_nft) return _nft._doc;
};

export const getAllNfts = async () => {
  const allNfts = await Nft.find();
  return allNfts;
};

export const getNftInfoById = async (nftId, collectionAddress) => {
  const _nft = await Nft.findOne({
    collectionAddress: collectionAddress,
    itemId: nftId,
  });
  if (_nft) return _nft._doc;
};

export const getNftsByAddress = async (ownerAddress) => {
  const allNfts = await Nft.find({ owner: ownerAddress });
  return allNfts;
};

export const changeNftOwner = async (
  nftId,
  collectionAddress,
  prevOwner,
  newOwner
) => {
  const updatedNft = await Nft.findOneAndUpdate(
    { itemId: nftId, collectionAddress: collectionAddress, owner: prevOwner },
    { owner: newOwner }
  );
  return updatedNft._doc;
};
