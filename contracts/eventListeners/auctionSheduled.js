import CronJob from "node-cron";
import { getAuctions } from "../../utils/auctions.js";

const scheduledJobFunction = CronJob.schedule("* * * * *", async () => {
  const auctions = await getAuctions();
  console.log(auctions);
});

const initScheduledJobs = () => {
  scheduledJobFunction.start();
};

export default initScheduledJobs;
