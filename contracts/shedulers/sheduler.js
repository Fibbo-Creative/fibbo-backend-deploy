import { updateBalancesSheduler } from "./adminShceduler.js";
import { checkAuctionsSheduled } from "./auctionSheduled.js";
import { checkOffersSheduled } from "./offerSheduled.js";

const initScheduledJobs = () => {
  checkAuctionsSheduled.start();
  checkOffersSheduled.start();
  updateBalancesSheduler.start();
};

export default initScheduledJobs;
