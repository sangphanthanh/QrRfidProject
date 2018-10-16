//user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * Create User Schema
 */
const UserSchema = mongoose.Schema({
    username:   {   type: String,   require: true },
    password:   {   type: String,   require: true },
    IsAdmin:    {   type: Boolean,  require: true },
    RfidUID:    {   type: String,   require: true},
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
});

/**
 * 
 */
UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});


UserSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

UserSchema.methods.incLoginAttempts = function(callback) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, callback);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= config.MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + config.LOCK_TIME };
    }
    return this.update(updates, callback);
};

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

UserSchema.statics.getAuthenticated = function(username, password, callback) {
    this.findOne({ username: username }, function(err, user) {
        if (err) return callback(err);

        // make sure the user exists
        if (!user) {
            return callback(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return callback(err);
                return callback(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return callback(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return callback(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return callback(err);
                    return callback(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return callback(err);
                return callback(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};


const User = module.exports = mongoose.model('User',UserSchema);

/**
 * Get user by id
 * @param {*} id 
 * @param {*} callback 
 */
module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}

/**
 * Get user by username 
 * @param {*} username 
 * @param {*} callback 
 */
module.exports.getUserByUsername = function(username,callback){
    const query = {username: username}
    User.findOne(query,callback);
}

/**
 * Add new User 
 * @param {*} newUser 
 * @param {*} callback 
 */
module.exports.addUser = function(newUser, callback){
    bcrypt.genSalt(config.SALT_WORK_FACTOR,(err,salt)=>{
        bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if(err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        })
    });
}

/**
 * Compare password authenticate
 * @param {*} candidatePassword 
 * @param {*} hash 
 * @param {*} callback 
 */
module.exports.comparePassword = function(candidatePassword,hash,callback){
    bcrypt.compare(candidatePassword,hash,(err, isMatch)=>{
        if(err) throw err;
        callback(null, isMatch);
    });
}

/**
 * Find user from RFID key
 * @param {*} RfidUID 
 * @param {*} callback 
 */
module.exports.getUserByUID = function(RfidUID,callback){
    const query = {RfidUID: RifdUID}
    User.findOne(query,callback);
}

/**
 * find all user 
 * @param {*} callback 
 */
module.exports.getAll =  function(callback){
    User.find(callback);
}

/**
 * Update user 
 * @param {*} newUser 
 * @param {*} callback 
 */
module.exports.updateUser = function(newUser,callback){

    const query = {username:newUser.username}
    User.findOneAndUpdate(query,{$set:{IsAdmin:newUser.IsAdmin,RfidUID: newUser.RfidUID}},callback);
}

/**
 * find all user 
 * @param {*} callback 
 */
module.exports.findall = function(callback){
    User.find({},callback);
}

/**
 * Change password 
 * @param {*} uname 
 * @param {*} passwd 
 * @param {*} callback 
 */
module.exports.changepasswd = function(uname,passwd,callback){
    bcrypt.genSalt(config.roundSalt,(err,salt)=>{
        bcrypt.hash(passwd, salt, (err, hash)=>{
            if(err) throw err;
            passwd = hash;
            const query = {username:uname}
            User.findOneAndUpdate(query,{$set:{password:passwd}},callback);
        })
    });
}
/**
 * Remove User by ID
 * @param {*} userId 
 * @param {*} callback 
 */
module.exports.removeUser = function(userId,callback){
    User.findByIdAndRemove(userId,callback);
}
