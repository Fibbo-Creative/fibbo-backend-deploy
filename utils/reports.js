import Reports from "../models/reports.js";

export const getAllReports = async () => {
  const reports = await Reports.find();
  return reports;
};

export const getCollectionReports = async () => {
  const reports = await Reports.find({ type: "COLLECTION" });
  return reports;
};

export const getItemReports = async () => {
  const reports = await Reports.find({ type: "NFT" });
  return reports;
};

export const getProfileReports = async () => {
  const reports = await Reports.find({ type: "PROFILE" });
  return reports;
};

export const addReport = async (doc) => {
  const neReport = await Reports.create({ ...doc });
  return neReport;
};

export const deleteReport = async (type, reported, reporter) => {
  const deleted = await Reports.deleteOne({
    type: type,
    reported: reported,
    reporter: reporter,
  });
  return deleted;
};
