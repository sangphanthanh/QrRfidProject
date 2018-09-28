const mongoose = require('mongoose');
const randomString = require('randomstring');

/**
 * Create device Schema
 */
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
/**
 * 
 */
const Device = module.exports = mongoose.model('device',DeviceSchema);

/**
 * Add new Device
 * @param {*} newDevice 
 * @param {*} callback 
 */
module.exports.addDevice = function(newDevice, callback){
    newDevice.save(callback);
}

/**
 * Get Device By Mac Address
 * @param {*} Mac 
 * @param {*} callback 
 */
module.exports.getDeviceByMac = function(Mac,callback){
    const query = {Mac:Mac}
    Device.findOne(query,callback);
}

/**
 * Change Clock Status By Mac Address
 * @param {*} Mac 
 * @param {*} ClockStatus 
 * @param {*} callback 
 */
module.exports.putClockStatusByMac = function(Mac, ClockStatus, callback){
    const query = {Mac:Mac}
    Device.findOneAndUpdate(query,{$set:{ClockStatus:ClockStatus}},callback);
}

/**
 * Change Door Status By Mac Address
 * @param {*} Mac 
 * @param {*} DoorStatus 
 * @param {*} callback 
 */
module.exports.putDoorStatusByMac = function(Mac, DoorStatus, callback){
    // console.log('doorStatus: ' + DoorStatus);
    const query = {Mac:Mac}
    Device.findOneAndUpdate(query,{$set:{DoorStatus:DoorStatus}},callback);
}

/**
 * Generate QR code By Mac Address
 * @param {*} Mac 
 * @param {*} callback 
 */
module.exports.randomQRCodeByMac = function(Mac, callback){
    var qrgen = Mac + randomString.generate(10);
    console.log('QR Generation: '+qrgen);
    const query = {Mac:Mac}
    Device.findOneAndUpdate(query,{$set:{QRString:qrgen}},callback);
}

/**
 * Get Device by Id
 * @param {*} deviceId 
 * @param {*} callback 
 */
module.exports.getDeviceById = function(deviceId,callback){
    Device.findById(deviceId,callback);
}

/**
 * Update List UserID from in Device Object
 * @param {*} userId 
 * @param {*} deviceId 
 * @param {*} callback 
 */
module.exports.updateUserIdonDevice = function(userId,deviceId,callback){
    Device.findByIdAndUpdate(deviceId,{$push:{UserID:userId}},callback);
}

/**
 * Remove List UserID from in Device Object
 * @param {*} userId 
 * @param {*} deviceId 
 * @param {*} callback 
 */
module.exports.removeUserIdonDevice = function(userId,deviceId,callback){
    Device.findByIdAndUpdate(deviceId,{$pull:{UserID:userId}},callback);
}

/**
 * List all device
 * @param {*} callback 
 */
module.exports.findall = function(callback){
    Device.find({},callback);
}

/**
 * Update param for device
 * @param {*} device 
 * @param {*} callback 
 */
module.exports.updateDevice = function(device, callback){
    const query = {_id:device._id}
    Device.findOneAndUpdate(query,{$set:{Mac:device.Mac,ChipSerial: device.ChipSerial,IsActive: device.IsActive,
        ClockID:device.ClockID,ClockStatus: device.ClockStatus,ClockDescription: device.ClockDescription,
        DoorID: device.DoorID,DoorStatus: device.DoorStatus,DoorDescription: device.DoorDescription}},callback);
}

/**
 * Remove ALL UserID onto Devices
 * @param {*} userId 
 * @param {*} callback 
 */
module.exports.removeUserIDOnAllDevices = function(userId,callback){
    Device.update({},{$pull:{UserID:userId}},{multi: true},callback);
}

/**
 * Delete Device
 * @param {deviceID} deviceId 
 * @param {*} callback 
 */
module.exports.removeDevice = function(deviceId, callback){
    Device.findByIdAndRemove(deviceId,callback);
}