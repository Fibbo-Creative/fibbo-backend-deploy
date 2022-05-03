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

export const deleteNftForSale = async (collectionAddress, nftForSaleId) => {
  const deletedNft = await NftForSale.findOneAndDelete({
    collectionAddress: collectionAddress,
    itemId: nftForSaleId,
  });
  return deletedNft;
};
