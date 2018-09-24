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
});

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
    bcrypt.genSalt(config.roundSalt,(err,salt)=>{
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
