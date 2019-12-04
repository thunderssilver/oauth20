
const passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

//local setup
passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },//local sign-up
    function(req, email, password, done){
        process.nextTick(function(){
            User.findOne({'local.username': email}, function(err, user){
                if(err)
                    return done(err);
                if(user){
                    return done(null, false, req.flash('signupMessage', 'That email already taken'));//
                } else {
                    var newUser = new User();
                    newUser.local.username = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null, newUser);
                    })
                }
            })

        });
    }));
//local login
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done){
            process.nextTick(function(){
                User.findOne({ 'local.username': email}, function(err, user){
                    if(err)
                        return done(err);
                    if(!user)
                        return done(null, false,req.flash('loginMessage', 'No User found'));//, 
                    if(!user.validPassword(password)){
                        return done(null, false, req.flash('loginMessage', 'invalid password'));//
                    }
                    return done(null, user);

                });
            });
        }
    ));

    function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

//fb setup
passport.use(new FacebookStrategy({
        clientID: keys.facebookAuth.clientID,
        clientSecret: keys.facebookAuth.clientSecret,
        callbackURL: keys.facebookAuth.callbackURL
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);
            process.nextTick(function(){
                User.findOne({'facebook.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        console.log('user is: ', user);
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        newUser.facebook.name = profile.displayName;
                        newUser.facebook.email = profile.displayName;

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                        
                    }
                });
            });
        }

    ));

//google setup
passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        console.log(profile);
        User.findOne({'google.googleId': profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                /*new User({
                    google.googleId: profile.id,
                    google.username: profile.displayName,
                    google.thumbnail: profile._json.picture
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });*/

                var newUser = new User();
                        newUser.google.googleId = profile.id;
                        newUser.google.username = profile.displayName;
                        newUser.google.thumbnail = profile._json.picture;
                    

                        newUser.save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);
module.exports = initialize
