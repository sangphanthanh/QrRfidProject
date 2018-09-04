//user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

//UserSchema
const UserSchema = mongoose.Schema({
    username:   {   type: String,   require: true },
    password:   {   type: String,   require: true },
    IsAdmin:    {   type: Boolean,  require: true },
    RfidUID:    {   type: String,   require: true},
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
module.exports.getUserByUID = function(RfidUID,callback){
    const query = {RfidUID: RifdUID}
    User.findOne(query,callback);
}

//get all User
module.exports.getAll =  function(callback){
    User.find(callback);
}

//Update User
module.exports.updateUser = function(newUser,callback){
    bcrypt.genSalt(config.roundSalt,(err,salt)=>{
        bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if(err) throw err;
            newUser.password = hash;
            const query = {username:newUser.username}
            User.findOneAndUpdate(query,{$set:{password:newUser.password,IsAdmin:newUser.IsAdmin,RfidUID: newUser.RfidUID}},callback);
        })
    });
   
}

module.exports.findall = function(callback){
    User.find({},callback);
}