import Reports from "../models/reports.js";

export const getAllReports = async () => {
  const Reports = await Reports.find();
  return Reports;
};

export const getCollectionReports = async () => {
  const Reports = await Reports.find({ type: "COLLECTION" });
  return Reports;
};

export const getItemReports = async () => {
  const Reports = await Reports.find({ type: "NFT" });
  return Reports;
};

export const getProfileReports = async () => {
  const Reports = await Reports.find({ type: "PROFILE" });
  return Reports;
};

export const addReport = async (doc) => {
  const Reports = await Reports.create({ ...doc });
  return Reports;
};

export const deleteReport = async (type, reported) => {
  const Reports = await Reports.deleteOne({ name: name });
  return Reports;
};

export const getCategoryInfo = async (identifier) => {
  const Reports = await Reports.findOne({ identifier: identifier });
  return Reports._doc;
};
