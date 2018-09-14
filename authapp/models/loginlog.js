const mongoose = require('mongoose');

//LogSchema
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

module.exports.addLoginLog = function(newLog, callback){
    var day = new Date();
    newLog.Info.Timestamp = day;
    newLog.save(callback);
}
//trace all log
module.exports.traceLog = function(callback){
    LoginLog.find(callback);
}

//find by device
module.exports.findByMacDevice = function(macDevice,callback){
    const query = {Device: macDevice}
    LoginLog.findOne(query,callback);
}

//find by service
module.exports.findByServices = function(service,callback){
    const query = {TypeOfServices: service}
    LoginLog.findOne(query,callback);
}