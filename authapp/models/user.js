//user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

//UserSchema
const UserSchema = mongoose.Schema({
    username:   {   type: String,   require: true },
    password:   {   type: String,   require: true },
    IsAdmin:    {   type: Boolean,  require: true },
    RifdUID:    {   type: String,   require: true},
});

const User = module.exports = mongoose.model('User',UserSchema);

//GetUserById
module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}

//GetUserByUsername
module.exports.getUserByUsername = function(username,callback){
    const query = {username: username}
    User.findOne(query,callback);
}

//AddUser
module.exports.addUser = function(newUser, callback){
    bcrypt.genSalt(config.roundSalt,(err,salt)=>{
        bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if(err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        })
    });
}

//comparePassword
module.exports.comparePassword = function(candidatePassword,hash,callback){
//    console.log('CanPassword '+ candidatePassword);
//    console.log('Hash ' + hash);
    bcrypt.compare(candidatePassword,hash,(err, isMatch)=>{
        if(err) throw err;
        callback(null, isMatch);
    });
}

//find User base on UID
module.exports.getUserByUID = function(RifdUID,callback){
    const query = {RifdUID: RifdUID}
    User.findOne(query,callback);
}