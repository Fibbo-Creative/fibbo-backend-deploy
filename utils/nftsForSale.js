import NftForSale from "../models/nftForSale.js";

export const getAllNftsForSale = async () => {
  const allNfts = await NftForSale.find();
  return allNfts;
};

export const getNftForSaleById = async (collectionAddress, tokenId) => {
  const _nftForSale = await NftForSale.findOne({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  if (_nftForSale) return _nftForSale;
};

export const deleteNftForSale = async (collectionAddress, tokenId) => {
  const deletedNft = await NftForSale.deleteOne({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  return deletedNft;
};
