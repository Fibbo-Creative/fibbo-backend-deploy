import CronJob from "node-cron";

const scheduledJobFunction = CronJob.schedule("* * * * *", () => {
  console.log("I'm executed on a schedule!");
});

const initScheduledJobs = () => {
  scheduledJobFunction.start();
};

export default initScheduledJobs;
