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
    UserID:     [mongoose.Schema.Types.ObjectId],
});

const Device = module.exports = mongoose.model('device',DeviceSchema);

//Add new Device
module.exports.addDevice = function(newDevice, callback){
    newDevice.save(callback);
}

//Get Device by UserID
module.exports.getDeviceByUserID = function(UserID,callback){
    const query = {UserID:UserID}
    Device.findOne(query,callback);
}

//Get Device By MACAddress
module.exports.getDeviceByMac = function(Mac,callback){
    const query = {Mac:Mac}
    Device.findOne(query,callback);
}
//PUT ClockStatus By MacAddress
module.exports.putClockStatusByMac = function(Mac, ClockStatus, callback){
    const query = {Mac:Mac}
    Device.findOneAndUpdate(query,{$set:{ClockStatus:ClockStatus}},callback);
}
//PUT DoorStatus By MacAddress
module.exports.putDoorStatusByMac = function(Mac, DoorStatus, callback){
    console.log('doorStatus: ' + DoorStatus);
    const query = {Mac:Mac}
    Device.findOneAndUpdate(query,{$set:{DoorStatus:DoorStatus}},callback);
}

//PUT QRCode By MacAddress
module.exports.putQRCodeByMac = function(Mac, QRCode, callback){
    const query = {Mac:Mac}
    Device.findOneAndUpdate(query,{$set:{QRCode:QRCode}},callback);
}