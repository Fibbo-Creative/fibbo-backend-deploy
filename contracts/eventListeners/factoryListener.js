import { FACTORY_CONTRACT } from "..";

export const listenToFactoryEvents = () => {
  //ITEMS
  FACTORY_CONTRACT.on("ContractCreated", async (creator, address) => {});
  FACTORY_CONTRACT.on("ContractDisabled", async (caller, address) => {});
};
