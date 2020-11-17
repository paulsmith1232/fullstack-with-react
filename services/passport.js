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
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleId: profile.id }) //checks if user is new or existing
      .then((existingUser) => {            // this only runs if an a user is found (new or existing)
        if (existingUser) {                // if true we already have a record of them
          done(null, existingUser);
        } else {
          new User ({ googleId: profile.id })
            .save()
            .then(user => done(null, user))
        }
      })    
  })
);