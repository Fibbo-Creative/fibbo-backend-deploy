export const nftForSaleSchema = {
  name: "nftForSale",
  title: "NFT Items For Sale",
  type: "document",
  fields: [
    {
      name: "nft",
      title: "Nft Name",
      type: "reference",
      to: [{ type: "nft" }],
    },
    {
      name: "collectionAddress",
      title: "Nft Collection Address",
      type: "string",
    },
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "itemId",
      title: "NFT for sale id",
      type: "number",
    },
    {
      name: "tokenId",
      title: "NFT Token id",
      type: "number",
    },
    {
      name: "price",
      title: "Nft Price",
      type: "number",
    },
    {
      name: "forSaleAt",
      title: "Date put for sale",
      type: "date",
    },
  ],
};
