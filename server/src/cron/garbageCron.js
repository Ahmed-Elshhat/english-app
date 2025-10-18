// cron/garbageCron.js
const cron = require("node-cron");
const cleanGarbage = require("../controllers/garbageCollector");

// Run every 6 hours (00, 06, 12, 18)
cron.schedule("0 */6 * * *", async () => {
  console.log("🧹 Running garbage collector...");
  await cleanGarbage();
  console.log("✅ Garbage cleanup completed.");
});
