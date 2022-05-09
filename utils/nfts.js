import Nft from "../models/nft.js";

export const getNftInfo = async (owner, nftId, collectionAddress) => {
  const _nft = await Nft.findOne({
    owner: owner,
    tokenId: nftId,
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
    tokenId: nftId,
  });
  if (_nft) return _nft._doc;
};

export const getNftsByAddress = async (ownerAddress) => {
  const allNfts = await Nft.find({ owner: ownerAddress });
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
