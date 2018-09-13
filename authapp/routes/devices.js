const express = require('express');
const router = express.Router();
const passport = require('passport');
const Device = require('../models/device');
const User = require('../models/user');
const randomString = require('randomstring');
const LoginLog = require('../models/loginlog');

router.post('/addDevice',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    if(req.user.IsAdmin == true){
        let newDevice = new Device({
            Mac:        req.body.Mac,
            ChipSerial: req.body.ChipSerial,
            IsActive:   req.body.IsActive,
            // QRString:   req.body.QRString,
            ClockID:    req.body.ClockID,
            ClockStatus:req.body.ClockStatus,
            ClockDescription:req.body.ClockDescription,
            DoorID:     req.body.DoorID,
            DoorStatus: req.body.DoorStatus,
            DoorDescription:req.body.DoorDescription,
            UserID:     req.body.UserID
        });
        newDevice.QRString = newDevice.Mac + randomString.generate(10);
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
    }else{
        res.json({success: false, msg: 'Do Not Have Permission'});
    }
});
//GetListDevice
// router.get('/listDevice',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
//     console.log(req.user);
//     Device.getDeviceByUserID(req.user._id,(err,device)=>{
//         if(err) throw err;
// 		if(!device){
// 			return res.json({success: false, msg: 'Device not found'});
//         }else{
//             res.json({device});
//         }
//     });
// });
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
			return res.json({success: false});
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
			return res.json({success: false});
        }else{
            res.json({DoorStatus: device.DoorStatus});
            console.log('Device : '+req.params.MACAdd+' trail DoorStatus: '+device.DoorStatus);
        }
    });
});

//Update ClockStatus base on MAC
router.put('/updateclockstatus/:MACAdd',(req,res,next)=>{
    var newClockStatus = req.body.ClockStatus;
    // console.log('Type of ClockStatus :'+typeof(newClockStatus));
    if(typeof(newClockStatus)=='boolean'){

    Device.putClockStatusByMac(req.params.MACAdd,newClockStatus,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false});
        }else{
            res.json({Success: true});
            console.log('Update ClockStatus= '+newClockStatus);

        }
    });
    }else{
        res.json({Success: false});
    }
});
//Update DoorStatus base on MAC
router.put('/updatedoorstatus/:MACAdd',(req,res,next)=>{
    var newDoorStatus = req.body.DoorStatus;
// console.log('Status door: '+newDoorStatus);
    if(typeof(newDoorStatus)=='boolean'){
    Device.putDoorStatusByMac(req.params.MACAdd,newDoorStatus,(err,device)=>{
        if(err) throw err;
		if(!device){
			return res.json({success: false});
        }else{
            res.json({Success: true});
            console.log('Update DoorStatus= '+newDoorStatus);
        }
    });
    }else{
        res.json({Success: false});
    }
});

//Open Clock if UID 
router.put('/openclockonuid/:MACAdd',(req,res,next)=>{
    var uid = req.body.RfidUID;
    var errFlag = false;
    var msgErr;
    // console.log('UID: '+uid);
    Device.getDeviceByMac(req.params.MACAdd,(err,device)=>{
        if(err) throw err;
		if(!device){
            errFlag = true;
            msgErr = 'Device not found';
			// return res.json({success: false, msg: 'Device not found'});
        }else{
            for(var i = 0; i < device.UserID.length; i++){
                // console.log("User ID: "+device.UserID[i]);
                User.getUserById(device.UserID[i],(err,user)=>{
                    if(err) throw err;
                    if(!user){
                        errFlag = true;
                        msgErr = 'User not found';
                        // res.json({success: false, msg: 'User not found'});
                        console.log('User not found')
                    }else{

                        if(user.RfidUID === uid){
                            var newClockStatus = true;
                            if(typeof(newClockStatus)=='boolean'){
                                Device.putClockStatusByMac(req.params.MACAdd,newClockStatus,(err,device)=>{
                                    // console.log('clock status by mac');
                                    if(err) throw err;
                                    if(!device){
                                        errFlag = true;
                                        msgErr = 'Device not found';
                                    // res.json({success: false, msg: 'Device not found'});
                                    }else{
                                        let loginLog = new LoginLog({
                                            Device: device.Mac,
                                            TypeOfServices: 'RFID',
                                            Info:{
                                                DoorStatus: newClockStatus,
                                                Actor:    user.username,
                                            }
                                        })
                                        LoginLog.addLoginLog(loginLog,(err,lolog)=>{
                                            if(err) throw err;
                                        })
                                        // console.log('Uid open door');
                                        errFlag = false;
                                        msgErr = 'Update successfully';
                                        // res.json({Success: true , msg: 'Update successfully' , ClockStatus: newClockStatus});
                                    }
                            })
                        }else{
                            errFlag = true;
                            msgErr = 'Update fail';
                            // res.json({Success: false , msg: 'Update fail'});
                        }
                    }else{
                        errFlag = true;
                        msgErr = 'Uid not match';
                        // res.json({Success: false , msg: 'Uid not match'});
                    }
                }})
            }
        }
        if(errFlag==true){
            res.json({Success: false});
        }else{
            res.json({Success: true});
        }
    });
});

//Check QRCode from Mobile
router.post('/CheckQRCode',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    var qrCheck = req.body.qrCheck;
    var addMac = qrCheck.substring(0, 17);
    console.log('Mac1: ' + addMac);
    Device.getDeviceByMac(addMac,(err,device)=>{
        if(err) throw err;
        if(!device){
            res.json({Success: false, msg: 'Device not found'});
        }else{
            if(device.QRString == qrCheck){
                Device.putClockStatusByMac(addMac,true,(err,device)=>{
                    if(err) throw err;
                    if(!device){
                        return res.json({success: false, msg: 'Device not found'});
                    }else{
                        // res.json({Success: true , msg: 'Update successfully' , ClockStatus: newClockStatus});
                        Device.randomQRCodeByMac(addMac, (err,device)=>{
                            if(err) throw err;
                            if(!device){
                                return res.json({success: false, msg: 'Device not found'});
                            }else{
                                let loginLog = new LoginLog({
                                    Device: device.Mac,
                                    TypeOfServices: 'QRScan',
                                    Info:{
                                        DoorStatus: true,
                                        Actor:    req.user.username,
                                    }
                                })
                                LoginLog.addLoginLog(loginLog,(err,lolog)=>{
                                    if(err) throw err;
                                })
                                return res.json({success: true, msg: 'Updated new QRCode'});
                            }
                        });
                    }
                });
                }else{
                    res.json({Success: false , msg: 'Update fail'});
                }
            }

        }
    );
    //put QRCode by Mac
            // var qrgen = randomString.generate();
            // console.log('QR Generation: '+qrgen);
            // Device.putQRCodeByMac(req.params.MACAdd,qrgen,(err,device)=>{
            //     if(err) throw err;
            //     if(!device){
            //         console.log('Device not found!');
            //     }else{
            //         console.log('Update QR Code Successfully');
            //     }
            // });
});

//Update UserID on Device
router.put('/updateUserIdOnDevice',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    var userId = req.body.userID;
    var deviceId = req.body.deviceID;
    Device.updateUserIdonDevice(userId,deviceId,(err,device)=>{
        if(err) throw err;
        if(!device){
            res.json({Success: false , msg: 'Update fail'});
        }else{
            res.json({Success: true , msg: 'Update successfully'});
        }
    })
});

//Get List device
router.get('/listdevice',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    Device.findall((err,listDevice)=>{
        if(err) throw err;
        if(!listDevice){
            res.json({Success: false , msg: 'Empty'});
        }else{
            res.send(listDevice);
        }
    });
});

//Update module device
router.put('/updateDevice',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    var tempUser = req.user;
	if(tempUser.IsAdmin == true){
		let newDevice = new Device({
            _id:        req.body._id,
            Mac:        req.body.Mac,
            ChipSerial: req.body.ChipSerial,
            IsActive:   req.body.IsActive,
            //QRString:   req.body.QRString,
            ClockID:    req.body.ClockID,
            ClockStatus:req.body.ClockStatus,
            ClockDescription:req.body.ClockDescription,
            DoorID:     req.body.DoorID,
            DoorStatus: req.body.DoorStatus,
            DoorDescription:req.body.DoorDescription,
            // UserID:     req.body.UserID
        });
        Device.updateDevice(newDevice,(err,device)=>{
            if(err){
                return res.json({success: false, msg: 'Update error'});
            }else{
                return res.json({success: true, msg: 'Successful to update'});
            }
        })
	}else{
		return res.json({success: false, msg: 'Permission require'});
	}
});

module.exports = router;