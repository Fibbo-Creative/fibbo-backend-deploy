import { updateCollectionAddress } from "../../utils/collections.js";
import { getFactoryContract } from "../index.js";

export const listenToFactoryEvents = async () => {
  const FACTORY_CONTRACT = await getFactoryContract();
};
