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
  //Delete NFt
  const deletedNft = await NftForSale.deleteOne({
    collectionAddress: collectionAddress,
    tokenId: tokenId,
  });
  return deletedNft;
};

export const changePrice = async (
  collectionAddress,
  tokenId,
  owner,
  newPrice
) => {
  //Change item price
  const updatedListing = await NftForSale.updateOne(
    {
      collectionAddress: collectionAddress,
      tokenId: tokenId,
      owner: owner,
    },
    { price: newPrice }
  );
  return updatedListing;
};
