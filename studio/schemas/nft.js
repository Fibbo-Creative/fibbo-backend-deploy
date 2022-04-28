export const nftSchema = {
  name: "nft",
  title: "NFT Items",
  type: "document",
  fields: [
    {
      name: "collection",
      title: "Nft Collection",
      type: "reference",
      to: [{ type: "collection" }],
    },
    {
      name: "collectionAddress",
      title: "Nft Collection Address",
      type: "string",
    },
    {
      name: "name",
      title: "Nft Name",
      type: "string",
    },
    {
      name: "description",
      title: "Nft Description",
      type: "string",
    },
    {
      name: "owner",
      title: "Nft Owner",
      type: "string",
    },
    {
      name: "creator",
      title: "NFT Creator",
      type: "string",
    },
    {
      name: "itemId",
      title: "Nft ItemId",
      type: "number",
    },
    {
      name: "image",
      title: "NFT Image",
      type: "string",
    },
    {
      name: "royalty",
      title: "Nft Royalty",
      type: "number",
    },
  ],
};
