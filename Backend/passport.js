import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./Models/UserModel.js";

// -------------------------
// 🔹 JWT Strategy
// -------------------------
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        console.error("JWT user not found:", jwt_payload.id);
        return done(null, false);
      }
    } catch (err) {
      console.error("JWT auth error:", err);
      return done(err, false);
    }
  })
);

// -------------------------
// 🔹 Google OAuth Strategy
// -------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // get from Google Cloud Console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/user/google/callback", // adjust backend URL if needed
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if not found
          user = await User.create({
            googleId: profile.id,
            firstname: profile.name?.givenName || "Google",
            lastname: profile.name?.familyName || "User",
            email: profile.emails?.[0]?.value || "",
            isEmailVerified: true,
            password: "GoogleAuth", // placeholder, not used
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, false);
      }
    }
  )
);

// -------------------------
// 🔹 Serialize / Deserialize
// -------------------------
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
