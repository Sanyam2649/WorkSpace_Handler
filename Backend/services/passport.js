const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const cloudinary = require("../config/cloudClient");
const logger = require("../config/logger"); // Add this line

function ensureStrategyAllowed(clientId, clientSecret) {
  const isAllowed = Boolean(clientId && clientSecret && clientId !== '');
  
  if (!isAllowed) {
    logger.warn("OAuth strategy configuration missing", { 
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0
    });
  }
  
  return isAllowed;
}

async function upsertOAuthUser({ provider, providerId, profile, email, avatar, username }) {
  try {
    const emailLower = email?.toLowerCase();
    let user = await User.findOne({ email: emailLower });
    let avatarData = null;
    avatar = (avatar) ? avatar : profile.picture;
    
    logger.info("OAuth user upsert attempt", { 
      provider, 
      providerId, 
      email: emailLower, 
      existingUser: !!user 
    });

    // Handle avatar upload to Cloudinary
    if (avatar && !user?.avatar?.url) {
      try {
        logger.debug("Attempting Cloudinary avatar upload", { provider, email: emailLower });
        
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
        
        logger.info("Avatar uploaded to Cloudinary successfully", { 
          provider, 
          email: emailLower,
          publicId: uploadResult.public_id 
        });
      } catch (err) {
        logger.error("Cloudinary avatar upload failed", { 
          error: err.message, 
          stack: err.stack, 
          provider, 
          email: emailLower 
        });
        avatarData = null;
      }
    }

    // If user exists, check if provider is already linked
    if (user) {
      const alreadyLinked = user.providers.some(
        (p) => p.provider === provider && p.providerId === providerId
      );
      
      if (!alreadyLinked) {
        logger.info("Linking new OAuth provider to existing user", { 
          userId: user._id, 
          provider, 
          email: emailLower 
        });
        
        user.providers.push({ provider, providerId, avatar: avatarData });
        await user.save();
      } else {
        logger.debug("OAuth provider already linked to user", { 
          userId: user._id, 
          provider 
        });
      }
      return user;
    }

    // Create new user
    const generatedUsername =
      (username || emailLower?.split('@')[0] || `${provider}-${uuidv4()}`).toLowerCase();

    logger.info("Creating new user from OAuth", { 
      provider, 
      providerId, 
      email: emailLower, 
      generatedUsername 
    });

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
    
    logger.info("New OAuth user created successfully", { 
      userId: user._id, 
      provider, 
      email: emailLower 
    });
    
    return user;
  } catch (error) {
    logger.error("Error in upsertOAuthUser", { 
      error: error.message, 
      stack: error.stack, 
      provider, 
      providerId, 
      email 
    });
    throw error; // Re-throw to be handled by the strategy
  }
}

function setupPassport() {
  logger.info("Initializing Passport OAuth strategies");
  
  // Google OAuth Strategy
  if (ensureStrategyAllowed(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)) {
    logger.info("Setting up Google OAuth strategy");
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/oauth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            logger.debug("Google OAuth callback received", { 
              profileId: profile.id, 
              displayName: profile.displayName,
              email: profile.emails?.[0]?.value 
            });
            
            const email = profile.emails?.[0]?.value;
            const avatar = profile.photos?.[0]?.value;
            const user = await upsertOAuthUser({
              provider: 'google',
              providerId: profile.id,
              profile: profile._json || {},
              email,
              avatar,
            });
            
            logger.info("Google OAuth authentication successful", { 
              userId: user._id, 
              email: user.email 
            });
            
            return done(null, user);
          } catch (err) {
            logger.error("Google OAuth authentication failed", { 
              error: err.message, 
              stack: err.stack, 
              profileId: profile.id 
            });
            return done(err);
          }
        }
      )
    );
  } else {
    logger.warn("Google OAuth strategy skipped due to missing configuration");
  }

  // GitHub OAuth Strategy
  if (ensureStrategyAllowed(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET)) {
    logger.info("Setting up GitHub OAuth strategy");
    
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
            logger.debug("GitHub OAuth callback received", { 
              profileId: profile.id, 
              username: profile.username,
              emailCount: profile.emails?.length || 0 
            });
            
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
            
            logger.info("GitHub OAuth authentication successful", { 
              userId: user._id, 
              email: user.email,
              username: user.username 
            });
            
            return done(null, user);
          } catch (err) {
            logger.error("GitHub OAuth authentication failed", { 
              error: err.message, 
              stack: err.stack, 
              profileId: profile.id,
              username: profile.username 
            });
            return done(err);
          }
        }
      )
    );
  } else {
    logger.warn("GitHub OAuth strategy skipped due to missing configuration");
  }

  // Serialize user for session
  passport.serializeUser((user, done) => {
    logger.debug("Serializing user for session", { userId: user._id });
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      logger.debug("Deserializing user from session", { userId: id });
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      logger.error("Error deserializing user", { 
        error: error.message, 
        stack: error.stack, 
        userId: id 
      });
      done(error);
    }
  });

  logger.info("Passport OAuth strategies initialization completed");
}

module.exports = { setupPassport };