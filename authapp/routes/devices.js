const express = require('express');
const router = express.Router();
const passport = require('passport');
const Device = require('../models/device');
const User = require('../models/user');
const randomString = require('randomstring');
const LoginLog = require('../models/loginlog');
const config = require('../config/config');
const DoorLog = require('../models/doorlog');

//
var lastDoorStatus = false;

/**
 * Router Add Device
 * Note: QRString will automatically generate base on MAC 
 */
router.post('/addDevice', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    if (req.user.IsAdmin == true) {
        let newDevice = new Device({
            Mac: req.body.Mac,
            ChipSerial: req.body.ChipSerial,
            IsActive: req.body.IsActive,
            ClockID: req.body.ClockID,
            ClockStatus: req.body.ClockStatus,
            ClockDescription: req.body.ClockDescription,
            DoorID: req.body.DoorID,
            DoorStatus: req.body.DoorStatus,
            DoorDescription: req.body.DoorDescription,
            UserID: req.body.UserID
        });
        //QR Random Gen 
        //newDevice.QRString = newDevice.Mac + randomString.generate(10);

        //QR Gen on MAC + ChipSerial 
        newDevice.QRString = newDevice.Mac + newDevice.ChipSerial;
        
        var tempDevice = Device.getDeviceByMac(newDevice.Mac, (err, device) => {
            if (err) throw err;
            if (!device) {
                Device.addDevice(newDevice, (err, device) => {
                    if (err) {
                        res.json({
                            success: false,
                            msg: config.ST_Code01
                        });
                    } else {
                        res.json({
                            success: true,
                            msg: config.ST_Code02
                        });
                        // console.log("Device Mac: "+ newDevice.Mac + " has been added");
                    }
                });
            } else {
                res.json({
                    success: false,
                    msg: config.ST_Code03
                });
            }
        })
    } else {
        res.json({
            success: false,
            msg: config.ER_Code03
        });
    }
});

/**
 * Trace QrCode from Mac Address
 */
router.get('/qrcode/:MACAdd', (req, res, next) => {
    Device.getDeviceByMac(req.params.MACAdd, (err, device) => {
        if (err) throw err;
        if (!device) {
            return res.json({
                success: false,
                msg: config.ST_Code05
            });
        } else {
            res.json({
                QRCode: device.QRString
            });
            // console.log('Device : '+req.params.MACAdd + ' trace QrCode: ' + device.QRString);
        }
    });
});

/**
 * Get Clock Status from Mac 
 */
router.get('/clockstatus/:MACAdd', (req, res, next) => {
    Device.getDeviceByMac(req.params.MACAdd, (err, device) => {
        if (err) throw err;
        if (!device) {
            return res.json({
                success: false
            });
        } else {
            res.json({
                ClockStatus: device.ClockStatus
            });
            // console.log('Device : '+req.params.MACAdd+' trace ClockStatus: '+device.ClockStatus);
        }
    });
});

/**
 * Get Door Status from Mac
 */
router.get('/doorstatus/:MACAdd', (req, res, next) => {
    Device.getDeviceByMac(req.params.MACAdd, (err, device) => {
        if (err) throw err;
        if (!device) {
            return res.json({
                success: false
            });
        } else {
            res.json({
                DoorStatus: device.DoorStatus
            });
            // console.log('Device : '+req.params.MACAdd+' trail DoorStatus: '+device.DoorStatus);
        }
    });
});

/**
 * Update Clock Status from Mac Address
 */
router.put('/updateclockstatus/:MACAdd', (req, res, next) => {
    var newClockStatus = req.body.ClockStatus;
    if (typeof (newClockStatus) == 'boolean') {
        Device.putClockStatusByMac(req.params.MACAdd, newClockStatus, (err, device) => {
            if (err) throw err;
            if (!device) {
                return res.json({
                    success: false
                });
            } else {
                res.json({
                    success: true
                });
                // console.log('Update ClockStatus = '+newClockStatus);
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});

/**
 * Update Door Status from Mac Address
 */
router.put('/updatedoorstatus/:MACAdd', (req, res, next) => {
    var newDoorStatus = req.body.DoorStatus;
    if (typeof (newDoorStatus) == 'boolean') {
        Device.putDoorStatusByMac(req.params.MACAdd, newDoorStatus, (err, device) => {
            if (err) throw err;
            if (!device) {
                return res.json({
                    success: false
                });
            } else {
                // console.log('Doorstt: '+ newDoorStatus + 'lastStt: '+lastDoorStatus);
                // if(currentDoor != lastDoorStatus){
                    // console.log('Stay here');
                    let doorLog = new DoorLog({
                        Device: device.Mac,
                        DoorStatus: newDoorStatus,
                    })
                    DoorLog.addDoorLog(doorLog, (err, lolog) => {
                        if (err) throw err;
                    })
                    // lastDoorStatus = newDoorStatus;
                // }
                res.json({
                    success: true
                });
                // console.log('Update DoorStatus = '+newDoorStatus);
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});

/**
 * Turn on Clock's door using RFID tag
 */
router.put('/openclockonuid/:MACAdd', (req, res, next) => {
    var uid = req.body.RfidUID;
    var errFlag = false;
    var msgErr;
    Device.getDeviceByMac(req.params.MACAdd, (err, device) => {
        if (err) throw err;
        if (!device) {
            errFlag = true;
            msgErr = config.ST_Code05;
        } else {
            for (var i = 0; i < device.UserID.length; i++) {
                User.getUserById(device.UserID[i], (err, user) => {
                    if (err) throw err;
                    if (!user) {
                        errFlag = true;
                        msgErr = config.ST_Code06;
                    } else {
                        if (user.RfidUID === uid) {
                            var newClockStatus = true;
                            if (typeof (newClockStatus) == 'boolean') {
                                Device.putClockStatusByMac(req.params.MACAdd, newClockStatus, (err, device) => {
                                    if (err) throw err;
                                    if (!device) {
                                        errFlag = true;
                                        msgErr = config.ST_Code05;
                                    } else {
                                        let loginLog = new LoginLog({
                                            Device: device.Mac,
                                            TypeOfServices: config.ST_Code07,
                                            Info: {
                                                DoorStatus: newClockStatus,
                                                Actor: user.username,
                                            }
                                        })
                                        LoginLog.addLoginLog(loginLog, (err, lolog) => {
                                            if (err) throw err;
                                        })
                                        errFlag = false;
                                        msgErr = config.ST_Code08;
                                    }
                                })
                            } else {
                                errFlag = true;
                                msgErr = config.ER_Code01;
                                // res.json({Success: false , msg: 'Update fail'});
                            }
                        } else {
                            errFlag = true;
                            msgErr = config.ST_Code09;
                            // res.json({Success: false , msg: 'Uid not match'});
                        }
                    }
                })
            }
        }
        if (errFlag == true) {
            res.json({
                success: false
            });
        } else {
            res.json({
                success: true
            });
        }
    });
});

/**
 * Check QR Code from Mobile
 */
router.post('/CheckQRCode', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    var qrCheck = req.body.qrCheck;
    var addMac = qrCheck.substring(0, 17);
    Device.getDeviceByMac(addMac, (err, device) => {
        if (err) throw err;
        if (!device) {
            res.json({
                success: false,
                msg: config.ST_Code05
            });
        } else {
            if (device.QRString == qrCheck) {
                Device.putClockStatusByMac(addMac, true, (err, device) => {
                    if (err) throw err;
                    if (!device) {
                        return res.json({
                            success: false,
                            msg: config.ST_Code05
                        });
                    } else {
                        // res.json({Success: true , msg: 'Update successfully' , ClockStatus: newClockStatus});
                        // Device.randomQRCodeByMac(addMac, (err, device) => {
                        //     if (err) throw err;
                        //     if (!device) {
                        //         return res.json({
                        //             success: false,
                        //             msg: config.ST_Code05
                        //         });
                        //     } else {
                                let loginLog = new LoginLog({
                                    Device: device.Mac,
                                    TypeOfServices: config.ST_Code10,
                                    Info: {
                                        DoorStatus: true,
                                        Actor: req.user.username,
                                    }
                                })
                                LoginLog.addLoginLog(loginLog, (err, lolog) => {
                                    if (err) throw err;
                                })
                                return res.json({
                                    success: true,
                                    msg: config.ST_Code08
                                });
                        //     }
                        // });
                    }
                });
            } else {
                res.json({
                    success: false,
                    msg: config.ER_Code01
                });
            }
        }

    });
});

/**
 * Update Userid from Device Object
 */
router.put('/updateUserIdOnDevice', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    var userId = req.body.userID;
    var deviceId = req.body.deviceID;
    var flagUserId = false;
    //Get Device Object
    Device.getDeviceById(deviceId, (err, device) => {
        if (err) throw err;
        if (!device) {
            res.json({
                success: false,
                msg: config.ST_Code05
            });
        } else {
            //Check UserID exits or not
            for (var i = 0; i < device.UserID.length; i++) {
                if (device.UserID[i] == userId) {
                    flagUserId = true;
                }
            }
            // Update userID on Device
            if (flagUserId == false) {
                Device.updateUserIdonDevice(userId, deviceId, (err, device) => {
                    if (err) throw err;
                    if (!device) {
                        res.json({
                            success: false,
                            msg: config.ER_Code01
                        });
                    } else {
                        res.json({
                            success: true,
                            msg: config.ER_Code02
                        });
                    }
                })
            } else {
                res.json({
                    success: false,
                    msg: config.ST_Code11
                });
            }
        }
    });

});

/**
 * Get all Device
 */
router.get('/listdevice', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    Device.findall((err, listDevice) => {
        if (err) throw err;
        if (!listDevice) {
            res.json({
                success: false,
                msg: config.ST_Code05
            });
        } else {
            res.send(listDevice);
        }
    });
});

/**
 * Update device
 */
router.put('/updateDevice', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    var tempUser = req.user;
    if (tempUser.IsAdmin == true) {
        let newDevice = new Device({
            _id: req.body._id,
            Mac: req.body.Mac,
            ChipSerial: req.body.ChipSerial,
            IsActive: req.body.IsActive,
            ClockID: req.body.ClockID,
            ClockStatus: req.body.ClockStatus,
            ClockDescription: req.body.ClockDescription,
            DoorID: req.body.DoorID,
            DoorStatus: req.body.DoorStatus,
            DoorDescription: req.body.DoorDescription,
        });
        Device.updateDevice(newDevice, (err, device) => {
            if (err) {
                return res.json({
                    success: false,
                    msg: config.ER_Code01
                });
            } else {
                return res.json({
                    success: true,
                    msg: config.ER_Code02
                });
            }
        })
    } else {
        return res.json({
            success: false,
            msg: config.ER_Code03
        });
    }
});

/**
 * Remove UserID onto Device
 */
router.put('/removeUserIdOnDevice', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    var userId = req.body.userID;
    var deviceId = req.body.deviceID;
    var flagUserId = false;
    //Get Device Object
    Device.getDeviceById(deviceId, (err, device) => {
        if (err) throw err;
        if (!device) {
            res.json({
                success: false,
                msg: config.ST_Code05
            });
        } else {
            //Check UserID exits or not
            for (var i = 0; i < device.UserID.length; i++) {
                if (device.UserID[i] == userId) {
                    flagUserId = true;
                }
            }
            // Update userID on Device
            if (flagUserId == true) {
                Device.removeUserIdonDevice(userId, deviceId, (err, device) => {
                    if (err) throw err;
                    if (!device) {
                        res.json({
                            success: false,
                            msg: config.ER_Code04
                        });
                    } else {
                        res.json({
                            success: true,
                            msg: config.ER_Code05
                        });
                    }
                })
            } else {
                res.json({
                    success: false,
                    msg: config.ST_Code06
                });
            }
        }
    });

});

/**
 * Delete device
 * Param: userID (request.body._id)
 */
router.post('/removedevice', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    var deviceId = req.body._id;
    Device.removeDevice(deviceId, (err, user) => {
        if (err) throw err;
        else {
            return res.json({
                success: true,
                msg: config.ER_Code05
            });
        }
    })
});
module.exports = router;