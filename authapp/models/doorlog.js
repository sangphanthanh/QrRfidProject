const mongoose = require('mongoose');


/**
 * Schema Door Status
 */
const DoorLogSchema = mongoose.Schema({
    Device: {type: String, require: true},
    DoorStatus: {type: Boolean, require: true},
    Timestamp:  {type: String, require: true},
    Note:  {type: String, require: true},
});

const DoorLog = module.exports = mongoose.model('doorlog',DoorLogSchema);
/**
 * Add Log
 * @param {*} newLog 
 * @param {*} callback 
 */
module.exports.addDoorLog = function(newLog, callback){
    var day = new Date();
    newLog.Info.Timestamp = day;
    newLog.save(callback);
}