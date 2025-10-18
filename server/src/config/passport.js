const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const dotenv = require("dotenv");
const crypto = require("crypto");
const FacebookStrategy = require("passport-facebook").Strategy;
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Employee = require("../models/employeeModel");
const SignupTracker = require("../models/signupTrackerModel");

dotenv.config();

function generateRandomPassword(length = 12) {
  return crypto.randomBytes(length).toString("hex").slice(0, length); // تحويل البايتات إلى نص
}

// ===================== Google Strategy =====================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/v1/auth/google/callback",
      passReqToCallback: true, // علشان نقدر نقرأ req ونجيب IP
    },
    asyncHandler(async (req, accessToken, refreshToken, profile, done) => {
      try {
        let ip =
          (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
            ?.split(",")[0]
            ?.trim() || "";
        ip = ip.replace("::ffff:", "");
        if (ip === "::1") ip = "127.0.0.1";

        let user =
          (await User.findOne({
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
          })) ||
          (await Employee.findOne({
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
          }));

        if (!user) {
          const email = profile.emails[0].value;

          // تحقق من سجل التسجيل السابق (IP أو إيميل)
          const previousSignup = await SignupTracker.findOne({
            $or: [{ ipAddresses: ip }, { emails: email }],
          });

          // هل يستحق نقاط التجربة؟
          const shouldGiveTrialPoints = !previousSignup;

          // إنشاء مستخدم جديد
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            password: generateRandomPassword(16),
            accessToken,
            points: shouldGiveTrialPoints ? 5 : 0,
          });

          // 4️⃣ تحديث أو إنشاء سجل المتتبع
          if (shouldGiveTrialPoints) {
            await SignupTracker.create({
              emails: [email],
              ipAddresses: [ip],
            });
          } else if (previousSignup) {
            await SignupTracker.updateOne(
              { _id: previousSignup._id },
              {
                $addToSet: { emails: email, ipAddresses: ip },
              }
            );
          }
        } else if (["user", "admin"].includes(user.role)) {
          user = await User.findOneAndUpdate(
            {
              $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value },
              ],
            },
            {
              $set: {
                accessToken,
                googleId: profile.id,
              },
            },
            { new: true }
          );
        } else if (user.role === "employee") {
          user = await Employee.findOneAndUpdate(
            {
              $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value },
              ],
            },
            {
              $set: {
                accessToken,
                googleId: profile.id,
              },
            },
            { new: true }
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    })
  )
);

// ===================== Facebook Strategy =====================
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "emails", "photos"], // مهمة جداً
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // نحاول نجيب الإيميل (بعض الحسابات مفيهاش)
        const email =
          profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
        // دور على المستخدم سواء في User أو Employee
        let user =
          (await User.findOne({
            $or: [{ facebookId: profile.id }, { email }],
          })) ||
          (await Employee.findOne({
            $or: [{ facebookId: profile.id }, { email }],
          }));

        // لو مش موجود، نضيفه
        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            name: profile.displayName || "Facebook User",
            email,
            password: generateRandomPassword(16),
            facebookAccessToken: accessToken,
          });
        } else if (["user", "admin"].includes(user.role)) {
          user = await User.findOneAndUpdate(
            { _id: user._id },
            {
              $set: {
                facebookId: profile.id,
                facebookAccessToken: accessToken,
              },
            },
            { new: true }
          );
        } else if (user.role === "employee") {
          user = await Employee.findOneAndUpdate(
            { _id: user._id },
            {
              $set: {
                facebookId: profile.id,
                facebookAccessToken: accessToken,
              },
            },
            { new: true }
          );
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user_, done) => {
  try {
    let user = null;
    if (["user", "admin"].includes(user_.role)) {
      user = await User.findById(user_._id);
    } else if (user_.role === "employee") {
      user = await Employee.findById(user_._id);
    }

    if (!user) {
      return done(new Error("User not found"), null);
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:8000/api/v1/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({
//           $or: [
//             { googleId: profile.id },
//             { email: profile.emails[0].value }, // تأكد إن دا المكان الصح للإيميل في `profile`
//           ],
//         });

//         if (!user) {
//           user = await Employee.findOne({
//             $or: [
//               { googleId: profile.id },
//               { email: profile.emails[0].value }, // تأكد إن دا المكان الصح للإيميل في `profile`
//             ],
//           });
//         }

//         if (!user) {
//           user = await User.create({
//             googleId: profile.id,
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             password: generateRandomPassword(16),
//             accessToken,
//           });
//         } else if (["user", "admin"].includes(user.role)) {
//           user = await User.findOneAndUpdate(
//             {
//               $or: [
//                 { googleId: profile.id },
//                 { email: profile.emails[0].value },
//               ],
//             },
//             {
//               $set: {
//                 accessToken,
//                 googleId: profile.id,
//               },
//             },
//             { new: true }
//           );
//         } else if (user.role === "employee") {
//           user = await Employee.findOneAndUpdate(
//             {
//               $or: [
//                 { googleId: profile.id },
//                 { email: profile.emails[0].value },
//               ],
//             },
//             {
//               $set: {
//                 accessToken,
//                 googleId: profile.id,
//               },
//             },
//             { new: true }
//           );
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );
