const express = require('express');
const router = express.Router();
const Loginlog = require('../models/loginlog');
const passport = require('passport');

router.get('/tracelog',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    Loginlog.traceLog((err,logLog)=>{
        if(err) throw err;
        if(!logLog){
            res.json({Success: false , msg: 'Empty'});
        }else{
            res.send(logLog);
        }
    });
});
//filter by mac
router.post('/tracelogbymac',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    var macDevice = req.body.macDevice;
    Loginlog.findByMacDevice(macDevice,(err,logLog)=>{
        if(err) throw err;
        if(!logLog){
            res.json({Success: false , msg: 'Empty'});
        }else{
            res.send(logLog);
        }
    });
});
//filter by type of service
router.post('/tracelogbyservice',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    var service= req.body.service;
    Loginlog.findByServices(service,(err,logLog)=>{
        if(err) throw err;
        if(!logLog){
            res.json({Success: false , msg: 'Empty'});
        }else{
            res.send(logLog);
        }
    });
});
module.exports = router;