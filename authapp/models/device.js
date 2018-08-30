const mongoose = require('mongoose');

const DeviceSchema = mongoose.Schema({
    Mac:        {type: String, require: true},
    ChipSerial: {type: String, require: true},
    IsActive:   {type: Boolean,require: true},
    QRString:   {type: String, require: true},
    ClockID:    {type: Number, require: true},
    ClockStatus:{type: Boolean,require: true},
    ClockDescription:{type:String, require:false},
    DoorID:     {type: Number, require: true},
    DoorStatus: {type: Boolean,require: true},
    DoorDescription:{type:String, require:false},
    UserID:     {type: String, require: true},
});

const Device = module.exports = mongoose.model('device',DeviceSchema);

//Add new Device
module.exports.addDevice = function(newDevice, callback){
    newDevice.save(callback);
}

//Get Device by UserID
module.exports.getDeviceByUserID = function(UserID,callback){
    console.log('UserID: '+UserID);
    const query = {UserID:UserID}
    Device.findOne(query,callback);
}

//Get QRCode By MACAddress
module.exports.getQRCodeByMac = function(Mac,callback){
    const query = {Mac:Mac}
    Device.findOne(query,callback);
}