const mongoose = require('mongoose');

//LogSchema
const LoginLogSchema = mongoose.Schema({
    DoorStatus: {type: Boolean, require: true},
    Creator:    {type: String, require: true},
    Timestamp:  {type: String, require: true},
});
const LoginLog = module.exports = mongoose.model('loginlog',LoginLogSchema);

module.exports.addLoginLog = function(newLog, callback){
    var day = new Date();
    newLog.Timestamp = day;
    newLog.save(callback);
}
//trace all log
module.exports.traceLog = function(callback){
    LoginLog.find(callback);
}