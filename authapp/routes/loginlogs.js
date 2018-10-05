const express = require('express');
const router = express.Router();
const Loginlog = require('../models/loginlog');
const passport = require('passport');
const config = require('../config/config');

/**
 * Trace log
 */
router.get('/tracelog', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    Loginlog.traceLog((err, logLog) => {
        if (err) throw err;
        if (!logLog) {
            res.json({
                success: false,
                msg: config.ST_Code04
            });
        } else {
            res.send(logLog);
        }
    });
});

/**
 * Trace log by Mac
 */
router.post('/tracelogbymac', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    var macDevice = req.body.macDevice;
    Loginlog.findByMacDevice(macDevice, (err, logLog) => {
        if (err) throw err;
        if (!logLog) {
            res.json({
                success: false,
                msg: config.ST_Code04
            });
        } else {
            res.send(logLog);
        }
    });
});

/**
 * Trace log by Service
 */
router.post('/tracelogbyservice', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    var service = req.body.service;
    Loginlog.findByServices(service, (err, logLog) => {
        if (err) throw err;
        if (!logLog) {
            res.json({
                success: false,
                msg: config.ST_Code04
            });
        } else {
            res.send(logLog);
        }
    });
});
module.exports = router;