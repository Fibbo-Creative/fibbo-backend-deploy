export const eventShema = {
  name: "event",
  title: "NFT events",
  type: "document",
  fields: [
    {
      name: "eventType",
      title: "Event Type",
      type: "string",
    },
    {
      name: "tokenId",
      title: "Token id",
      type: "number",
    },
    {
      name: "collectionAddress",
      title: "Collection",
      type: "string",
    },
    {
      name: "from",
      title: "Event Sender",
      type: "string",
    },
    {
      name: "to",
      title: "Event reciever",
      type: "string",
    },
    {
      name: "timestamp",
      title: "Date of transfer",
      type: "date",
    },
    {
      name: "price",
      title: "Event Price",
      type: "number",
    },
  ],
};
