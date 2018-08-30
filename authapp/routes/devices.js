const express = require('express');
const router = express.Router();
const passport = require('passport');
const Device = require('../models/device');
const User = require('../models/user');

router.post('/addDevice',(req,res,next)=>{
    let newDevice = new Device({
        Mac:        req.body.Mac,
        ChipSerial: req.body.ChipSerial,
        IsActive:   req.body.IsActive,
        QRString:   req.body.QRString,
        ClockID:    req.body.ClockID,
        ClockStatus:req.body.ClockStatus,
        ClockDescription:req.body.ClockDescription,
        DoorID:     req.body.DoorID,
        DoorStatus: req.body.DoorStatus,
        DoorDescription:req.body.DoorDescription,
        UserID:     req.body.UserID
    });
    var tempDevice = Device.getDeviceByMac(newDevice.Mac,(err,device)=>{
        if(err) throw err;
        if(!device){
            Device.addDevice(newDevice, (err,device)=>{
                if(err){
                    res.json({success: false , msg: 'Fail to add new device'});
                }else{
                    res.json({success: true, msg: 'Added new device'});
                    console.log("Device Mac: "+ newDevice.Mac + " has been added");
                }
            });
        }else{
            res.json({success: false, msg: 'Device already added'});
        }
    })
    
});
//GetListDevice
router.get('/listDevice',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    console.log(req.user);
    Device.getDeviceByUserID(req.user._id,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({device});
        }
    });
});
//getQrCode base on MAC
router.get('/qrcode/:MACAdd',(req,res,next)=>{
    Device.getDeviceByMac(req.params.MACAdd,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({QRCode: device.QRString});
            console.log('Device : '+req.params.MACAdd + ' trail QrCode: ' + device.QRString);
        }
    });
});

//getClockStatus base on MAC
router.get('/clockstatus/:MACAdd',(req,res,next)=>{
    Device.getDeviceByMac(req.params.MACAdd,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({ClockStatus: device.ClockStatus});
            console.log('Device : '+req.params.MACAdd+' trail ClockStatus: '+device.ClockStatus);
        }
    });
});
//getDoorStatus base on MAC
router.get('/doorstatus/:MACAdd',(req,res,next)=>{
    Device.getDeviceByMac(req.params.MACAdd,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({DoorStatus: device.DoorStatus});
            console.log('Device : '+req.params.MACAdd+' trail DoorStatus: '+device.DoorStatus);
        }
    });
});

//Update ClockStatus base on MAC
router.put('/updateclockstatus/:MACAdd',(req,res,next)=>{
    var newClockStatus = req.body.ClockStatus;
    if(typeof(newClockStatus)=='boolean'){
    Device.putClockStatusByMac(req.params.MACAdd,newClockStatus,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({Success: true , msg: 'Update successfully' , ClockStatus: newClockStatus});
        }
    });
    }else{
        res.json({Success: false , msg: 'Update fail'});
    }
});
//Update DoorStatus base on MAC
router.put('/updatedoorstatus/:MACAdd',(req,res,next)=>{
    var newDoorStatus = req.body.DoorStatus;
console.log('Status door: '+newDoorStatus);
    if(typeof(newDoorStatus)=='boolean'){
        console.log('Status boolean'+typeof(newDoorStatus));
    Device.putDoorStatusByMac(req.params.MACAdd,newDoorStatus,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({Success: true , msg: 'Update successfully' , DoorStatus: newDoorStatus});
        }
    });
    }else{
        res.json({Success: false , msg: 'Update fail'});
    }
});

//Open Clock if UID 
router.put('/openclockonuid/:MACAdd',(req,res,next)=>{
    var uid = req.body.RfidUID;
    console.log('UID: '+uid);
    Device.getDeviceByMac(req.params.MACAdd,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            for(var i = 0; i < device.UserID.length; i++){
                console.log("User ID: "+device.UserID);
                User.getUserById(device.UserID,(err,user)=>{
                    if(err) throw err;
                    if(!user){
                        return res.json({success: false, msg: 'User not found'});
                    }
                    if(user.RfidUID === uid){
                        var newClockStatus = true;
                        if(typeof(newClockStatus)=='boolean'){
                        Device.putClockStatusByMac(req.params.MACAdd,newClockStatus,(err,device)=>{
                            if(err) throw err;
                            if(!device){
                                return res.json({success: false, msg: 'Device not found'});
                            }else{
                                res.json({Success: true , msg: 'Update successfully' , ClockStatus: newClockStatus});
                            }
                        });
                        }else{
                            res.json({Success: false , msg: 'Update fail'});
                        }
                    }else{
                        res.json({Success: false , msg: 'Uid not match'});
                    }
                })
            }
        }
    });
});

module.exports = router;
