const express = require('express');
const router = express.Router();
const DoorLog = require('../models/doorlog');
const passport = require('passport');
const config = require('../config/config');

/**
 * Trace log
 */
router.get('/tracelog', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    DoorLog.traceLog((err, doorlog) => {
        if (err) throw err;
        if (!doorlog) {
            res.json({
                success: false,
                msg: config.ST_Code04
            });
        } else {
            res.send(doorlog);
        }
    });
});

module.exports = router;