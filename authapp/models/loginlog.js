const mongoose = require('mongoose');
const fs = require('fs');
const nodemailler = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const config = require('../config/config');
/**
 * Create log Schema
 */
const LoginLogSchema = mongoose.Schema({
    Device: {type: String, require: true},
    TypeOfServices: {type: String, require: true},
    Info:{
        DoorStatus: {type: Boolean, require: true},
        Actor:    {type: String, require: true},
        Timestamp:  {type: String, require: true},
    },
});
const LoginLog = module.exports = mongoose.model('loginlog',LoginLogSchema);

/**
 * add Log
 * @param {*} newLog 
 * @param {*} callback 
 */
module.exports.addLoginLog = function(newLog, callback){
    var day = new Date();
    newLog.Info.Timestamp = day;
    newLog.save(callback);
}

/**
 * Show Log
 * @param {*} callback 
 */
module.exports.traceLog = function(callback){
    LoginLog.find(callback);
}

/**
 * List log by Mac Dec Device
 * @param {*} macDevice 
 * @param {*} callback 
 */
module.exports.findByMacDevice = function(macDevice,callback){
    const query = {Device: macDevice}
    LoginLog.findOne(query,callback);
}

/**
 * List log by Services
 * @param {*} service 
 * @param {*} callback 
 */
module.exports.findByServices = function(service,callback){
    const query = {TypeOfServices: service}
    LoginLog.findOne(query,callback);
}

/**
 * System Log
 * @param {*Log message} msg 
 * @param {*} callback 
 */
// module.exports.system_log = function(msg,callback){
//     var datetime = new Date();
//     var file = 'authapp_system_log.txt';
//     var text = '['+ datetime+'] '+msg+'\r\n';
//     fs.appendFile(file,text,function(err){
//         if(err) throw err;
//     });
// }


module.exports.sendMailLoginFail = function(email,callback){
    let transporter = nodemailler.createTransport({
        service: 'Gmail',
        auth: {
            user: config.MAILLER_CONF_USERNAME, // generated ethereal user
            pass: config.MAILLER_CONF_PASSWORD // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"[QR Adquest Asia]"', // sender address
        to: 'adquestasia.kelvin@gmail.com', // list of receivers
        subject: '[QR Adquest Asia] [ Warning Login Notification]', // Subject line
        text: 'Content for Email', // plain text body
        html: '<b>Someone try to access account: </b>'+ email + '<br />'
        + '<b> At: </b>' +   Date()// html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
}
