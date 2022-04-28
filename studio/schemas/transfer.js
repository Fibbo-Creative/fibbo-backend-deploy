export const transferSchema = {
  name: "transfer",
  title: "NFT Transfer",
  type: "document",
  fields: [
    {
      name: "from",
      title: "Previous Owner",
      type: "string",
    },
    {
      name: "to",
      title: "Current Owner",
      type: "string",
    },
    {
      name: "boughtFor",
      title: "Price Bought For",
      type: "number",
    },
    {
      name: "boughtAt",
      title: "Date of transfer",
      type: "date",
    },
    {
      name: "nft",
      title: "Nft Transfered",
      type: "reference",
      to: [{ type: "nft" }],
    },
  ],
};
