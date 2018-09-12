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

module.exports = router;