const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {  // puts identifying info into a cookie
  done(null, user.id);
});

passport.deserializeUser((id, done) => {  // takes identifying info out of a cookie
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});

passport.use(
  new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true      
  }, 
  async (accessToken, refreshToken, profile, done) => {
    const existingUser = await User.findOne({ googleId: profile.id }) //checks if user is new or existing
      if (existingUser) {                                             // if true we already have a record of them
        return done(null, existingUser);     
      }         
      const user = await new User ({ googleId: profile.id }).save()   // we don't have a user record with this ID, so a new one is made
      done(null,user);      
  })
);