const mongoose = require('mongoose');

/**
 * Create log Schema
 */
const LoginLogSchema = mongoose.Schema({
    Device: {type: String, require: true},
    TypeOfServices: {type: String, require: true},
    Info:{
        DoorStatus: {type: Boolean, require: true},
        Actor:    {type: String, require: true},
        Timestamp:  {type: String, require: true},
    },
});
const LoginLog = module.exports = mongoose.model('loginlog',LoginLogSchema);

/**
 * add Log
 * @param {*} newLog 
 * @param {*} callback 
 */
module.exports.addLoginLog = function(newLog, callback){
    var day = new Date();
    newLog.Info.Timestamp = day;
    newLog.save(callback);
}

/**
 * Show Log
 * @param {*} callback 
 */
module.exports.traceLog = function(callback){
    LoginLog.find(callback);
}

/**
 * List log by Mac Dec Device
 * @param {*} macDevice 
 * @param {*} callback 
 */
module.exports.findByMacDevice = function(macDevice,callback){
    const query = {Device: macDevice}
    LoginLog.findOne(query,callback);
}

/**
 * List log by Services
 * @param {*} service 
 * @param {*} callback 
 */
module.exports.findByServices = function(service,callback){
    const query = {TypeOfServices: service}
    LoginLog.findOne(query,callback);
}