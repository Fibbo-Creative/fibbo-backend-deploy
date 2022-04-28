export const offerSchema = {
  name: "offerForNft",
  title: "Offer For NFT",
  type: "document",
  fields: [
    {
      name: "offerForNft",
      title: "Offer Made to",
      type: "reference",
      to: [{ type: "nft" }],
    },
    {
      name: "interested",
      title: "Name",
      type: "string",
    },
    {
      name: "offeredTo",
      title: "Offered to",
      type: "string",
    },
    {
      name: "forSaleAt",
      title: "Date put for sale",
      type: "date",
    },
  ],
};
