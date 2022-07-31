import PayToken from "../models/payToken.js";

export const getPayTokenInfo = async (address) => {
  const payToken = await PayToken.findOne({ contractAddress: address });
  return payToken;
};

export const getPayTokens = async (address) => {
  const payToken = await PayToken.find();
  return payToken;
};
