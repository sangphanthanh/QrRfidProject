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

//     var opts = {};
//     opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
//     // opts.jwtFromRequest = ExtractJwt.fromHeader('authorization');
//     opts.secretOrKey = 'AuthenticationTokenKey';

//     // var strategy = new JwtStrategy(opts, function(jwt_payload,next){
//     //     console.log('payload: ',jwt_payload);
//     // });
//     passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{
//         console.log('Payload  ' + jwt_payload._doc._id);
//         User.getUserById(jwt_payload._doc._id, (err, User) => {
//             if(err){
//                 return done(err, false);
//             }
//             if(user){
//                 return done(null, user);
//             }else{
//                 return done(null, false);
//             }
//         })
//     }));
 }

