import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import User from "./Models/UserModel.js"; // Your User model

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header
  secretOrKey: process.env.SECRET || "3nD$e5#FqRmF6kYgR@9VbFzT5jP!zH8L7Qw", // Secret key to verify JWT
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // Find the user by ID from the JWT payload
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user); // User found, proceed with authentication
      } else {
        console.error("User not found with ID:", jwt_payload.id); // Log if user not found
        return done(null, false); // User not found
      }
    } catch (err) {
      console.error("Error during authentication:", err); // Log the error
      done(err, false); // Error during authentication
    }
  })
);
