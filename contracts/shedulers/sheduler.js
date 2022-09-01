import { checkAuctionsSheduled } from "./auctionSheduled.js";
import { checkOffersSheduled } from "./offerSheduled.js";

const initScheduledJobs = () => {
  checkAuctionsSheduled.start();
  checkOffersSheduled.start();
};

export default initScheduledJobs;
