const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../api/v1/models/user.model');
const logger = require('../helpers/logger');

// Cấu hình Passport Google OAuth2
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          logger.info('Existing user found during Google OAuth login', { 
            userId: existingUser._id, 
            email: existingUser.email 
          });
          return done(null, existingUser);
        }

        // Nếu chưa tồn tại, tạo người dùng mới
        const newUser = await User.create({
          email: profile.emails[0].value,
          fullName: profile.displayName,
          password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10), // Mật khẩu ngẫu nhiên
          googleId: profile.id,
          isVerified: true, // Người dùng Google đã được xác minh email
          isActive: true,
          role: 'user',
          source: 'google',
          lastLogin: new Date(),
        });

        logger.info('New user created during Google OAuth login', { 
          userId: newUser._id, 
          email: newUser.email 
        });
        
        return done(null, newUser);
      } catch (error) {
        logger.error('Error during Google OAuth login', { error });
        return done(error, false);
      }
    }
  )
);

// Cấu hình Passport serialize/deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
