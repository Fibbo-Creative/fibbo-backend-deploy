import VerifyRequests from "../models/verifyRequests.js";

export const createVerifyRequest = async (doc) => {
  const newRequest = await VerifyRequests.create(doc);
  if (newRequest) {
    return newRequest._doc;
  }
};

export const getAllRequests = async () => {
  const requests = await VerifyRequests.find();
  if (requests) return requests;
};

export const deleteRequest = async (proposer) => {
  const deletedReq = await VerifyRequests.deleteOne({
    proposer: proposer,
  });
  if (deletedReq) return deletedReq;
};
