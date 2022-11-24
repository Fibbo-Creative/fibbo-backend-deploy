import { formatEther } from "ethers/lib/utils.js";
import CronJob from "node-cron";
import { updateOldBalance, updateOldGasStation } from "../../utils/admin.js";
import { gasStation } from "../address.js";
import { managerWallet, web3provider } from "../index.js";

export const updateBalancesSheduler = CronJob.schedule(
  "0 10 * * *",
  async () => {
    //Get manager wallet balance
    const managerBalance = await web3provider.getBalance(managerWallet);
    await updateOldBalance(formatEther(managerBalance));
    //Get relayer Balance
    const gasStationBalance = await web3provider.getBalance(gasStation);
    await updateOldGasStation(formatEther(gasStationBalance));
  }
);
