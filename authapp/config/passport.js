//passport.js
const  JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('../config/config');
const passport = require('passport');

// passport
passport.serializeUser(function(user, done) {

    done(null, user.id);

});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);

    });
});

module.exports = function(passport){
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    // console.log(jwt_payload);
    User.findById({ _id: jwt_payload._id }, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
    }));
}

