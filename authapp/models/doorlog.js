const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * Schema Door Status
 */
const DoorLogSchema = mongoose.Schema({
    Device: {type: String, require: true},
    DoorStatus: {type: Boolean, require: true},
    Timestamp:  {type: String, require: true},
    Note:  {type: String, require: true},
    createdAt: { type: Date, expires: config.expiresdoorlog, default: Date.now }
});

const DoorLog = module.exports = mongoose.model('doorlog',DoorLogSchema);
/**
 * Add Log
 * @param {*} newLog 
 * @param {*} callback 
 */
module.exports.addDoorLog = function(doorLog, callback){
    var day = new Date();
    doorLog.Timestamp = day;
    doorLog.save(callback);
}


/**
 * Show Log
 * @param {*} callback 
 */
module.exports.traceLog = function(callback){
    DoorLog.find(callback);
}