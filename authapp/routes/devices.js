const express = require('express');
const router = express.Router();
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

module.exports = router;