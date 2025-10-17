const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const cloudinary = require("../config/cloudClient");

function ensureStrategyAllowed(clientId, clientSecret) {
  return Boolean(clientId && clientSecret && clientId !== '');
}

async function upsertOAuthUser({ provider, providerId, profile, email, avatar, username }) {
  const emailLower = email?.toLowerCase();
  let user = await User.findOne({ email: emailLower });
  let avatarData = null;
  avatar = (avatar) ? avatar : profile.picture;
  if (avatar && !user?.avatar?.url) {
    try {
      const uploadResult = await cloudinary.uploader.upload(avatar, {
        folder: `avatars/${provider}`,
        use_filename: true,
        unique_filename: true,
        resource_type: 'image',
      });

      avatarData = {
        url: uploadResult.secure_url,
        originalName: uploadResult.original_filename,
        mimetype: uploadResult.format,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
      };
    } catch (err) {
      console.error('Cloudinary avatar upload failed:', err);
      avatarData = null;
    }
  }

  if (user) {
    const alreadyLinked = user.providers.some(
      (p) => p.provider === provider && p.providerId === providerId
    );
    if (!alreadyLinked) {
      user.providers.push({ provider, providerId, avatar: avatarData });
      await user.save();
    }
    return user;
  }

  const generatedUsername =
    (username || emailLower?.split('@')[0] || `${provider}-${uuidv4()}`).toLowerCase();

  user = new User({
    firstName: profile?.given_name || (profile?.name ? profile.name.split(' ')[0] : 'User'),
    lastName: profile?.family_name || (profile?.name ? profile.name.split(' ')[1] : ''),
    username: generatedUsername,
    email: emailLower || `${provider}-${uuidv4()}@example.local`,
    password: provider + ':' + providerId,
    providers: [{ provider, providerId, avatar: avatarData }],
    avatar: avatarData, // Save globally on user too, optional
  });

  await user.save();
  return user;
}


function setupPassport() {
  if (ensureStrategyAllowed(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/oauth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const avatar = profile.photos?.[0]?.value;
            const user = await upsertOAuthUser({
              provider: 'google',
              providerId: profile.id,
              profile: profile._json || {},
              email,
              avatar,
            });
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  if (ensureStrategyAllowed(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET)) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/oauth/github/callback',
          scope: ['user:email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const primaryEmail =
              (profile.emails || []).find((e) => e.primary)?.value ||
              profile.emails?.[0]?.value;
            const avatar = profile.photos?.[0]?.value;
            const user = await upsertOAuthUser({
              provider: 'github',
              providerId: profile.id,
              profile: profile._json || {},
              email: primaryEmail,
              username: profile.username,
              avatar,
            });
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }
}

module.exports = { setupPassport };
