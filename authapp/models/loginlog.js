const mongoose = require('mongoose');

//LogSchema
const LoginLogSchema = mongoose.Schema({
    DoorStatus: {type: Boolean, require: true},
    Creator:    {type: String, require: true},
    Timestamp:  {type: String, require: true},
});
const LoginLog = module.exports = mongoose.model('loginlog',LoginLogSchema);
