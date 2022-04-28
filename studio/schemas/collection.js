export const collectionSchema = {
  name: "collection",
  title: "NFT Collection",
  type: "document",
  fields: [
    {
      name: "contractAddress",
      title: "Contract Address",
      type: "string",
    },
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "numberOfItems",
      title: "Number of items",
      type: "number",
    },
  ],
};
