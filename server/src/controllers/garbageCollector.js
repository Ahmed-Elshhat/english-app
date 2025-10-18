// const fs = require("fs");
// const Garbage = require("../models/garbageModel");

// async function cleanGarbage() {
//   const garbageFiles = await Garbage.find();

//   // استخدم Promise.all لتشغيل كل العمليات معًا
//   await Promise.all(
//     garbageFiles.map(async (garbage) => {
//       try {
//         if (fs.existsSync(garbage.filePath)) {
//           fs.unlinkSync(garbage.filePath);
//           console.log(`🗑️ Deleted: ${garbage.filePath}`);
//         } else {
//           console.log(`⚠️ File not found: ${garbage.filePath}`);
//         }

//         await Garbage.deleteOne({ _id: garbage._id });
//       } catch (err) {
//         console.error(`❌ Failed to delete ${garbage.filePath}: ${err.message}`);
//       }
//     })
//   );
// }

// module.exports = cleanGarbage;

//////////////////////////////////////////////////////
const fs = require("fs");
const Garbage = require("../models/garbageModel");

async function cleanGarbage() {
  // const garbageFiles = await Garbage.find();

  const now = Date.now();
  const garbageFiles = await Garbage.find({
    addedAt: { $lt: new Date(now - 10 * 60 * 1000) }, // أقدم من 10 دقايق
  }).limit(50);

  let deletedCount = 0;
  let notFoundCount = 0;
  let failedCount = 0;

  await Promise.all(
    garbageFiles.map(async (garbage) => {
      try {
        const exists = await fs.promises
          .access(garbage.filePath, fs.constants.F_OK)
          .then(() => true)
          .catch(() => false);

        if (exists) {
          await fs.promises.unlink(garbage.filePath);
          deletedCount++;
          console.log(`🗑️ Deleted: ${garbage.filePath}`);
        } else {
          notFoundCount++;
          console.log(`⚠️ File not found: ${garbage.filePath}`);
        }

        await Garbage.deleteOne({ _id: garbage._id });
      } catch (err) {
        failedCount++;
        console.error(
          `❌ Failed to delete ${garbage.filePath}: ${err.message}`
        );
      }
    })
  );

  // await Promise.all(
  //   garbageFiles.map(async (garbage) => {
  //     try {
  //       if (fs.existsSync(garbage.filePath)) {
  //         fs.unlinkSync(garbage.filePath);
  //         deletedCount++;
  //         console.log(`🗑️ Deleted: ${garbage.filePath}`);
  //       } else {
  //         notFoundCount++;
  //         console.log(`⚠️ File not found: ${garbage.filePath}`);
  //       }

  //       await Garbage.deleteOne({ _id: garbage._id });
  //     } catch (err) {
  //       failedCount++;
  //       console.error(
  //         `❌ Failed to delete ${garbage.filePath}: ${err.message}`
  //       );
  //     }
  //   })
  // );

  console.log(
    `\n✅ ${deletedCount} deleted — ⚠️ ${notFoundCount} not found — ❌ ${failedCount} failed\n`
  );
}

module.exports = cleanGarbage;

// ⚙️ ملاحظة إضافية (تحسين الأمان)

// لو عدد الملفات كبير جدًا، ممكن بدل Promise.all تستخدم مكتبة زي p-map
//  لتحدد عدد العمليات اللي تشتغل في نفس الوقت (concurrency control).
// لكن في الحالة العادية — الطريقة اللي فوق ممتازة 💪
