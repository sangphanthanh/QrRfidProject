const express = require('express');
const router = express.Router();
const passport = require('passport');
const Device = require('../models/device');

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
    Device.addDevice(newDevice, (err,device)=>{
        if(err){
            res.json({success: false , msg: 'Fail to add new device'});
        }else{
            res.json({success: true, msg: 'Added new device'});
        }
    });
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
    console.log('MAC: '+req.params.MACAdd);
    Device.getDeviceByMac(req.params.MACAdd,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({QRCode: device.QRString});
        }
    });
});

//getClockStatus base on MAC
router.get('/clockstatus/:MACAdd',(req,res,next)=>{
    console.log('MAC: '+req.params.MACAdd);
    Device.getDeviceByMac(req.params.MACAdd,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false, msg: 'Device not found'});
        }else{
            res.json({ClockStatus: device.ClockStatus});
        }
    });
});
module.exports = router;