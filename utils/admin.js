import AdminBalance from "../models/admin/adminBalance.js";
import AdminUsers from "../models/adminusers.js";

export const getOldBalance = async () => {
  const old = await AdminBalance.findOne({ name: "manager" });
  return old._doc;
};

export const getOldGasStation = async () => {
  const gas = await AdminBalance.findOne({ name: "relayer" });
  return gas._doc;
};

export const updateOldBalance = async (newBalance) => {
  const updated = await AdminBalance.updateOne(
    { name: "manager" },
    { balance: newBalance }
  );
  return updated;
};

export const updateOldGasStation = async (newBalance) => {
  const updated = await AdminBalance.updateOne(
    { name: "relayer" },
    { balance: newBalance }
  );
  return updated;
};

export const findUser = async (email, psswd) => {
  const user = await AdminUsers.findOne({ email: email, password: psswd });
  return user;
};

export const findUserByToken = async (token) => {
  const user = await AdminUsers.findOne({ token: token });
  return user;
};
