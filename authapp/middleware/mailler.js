const nodemailler = require('nodemailer');
const config = require('../config/config');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
function createTestMailler(err) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: config.MAILLER_CONF_USERNAME, // generated ethereal user
            pass: config.MAILLER_CONF_PASSWORD // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"[QR Adquest Asia]" <adquestasia.kelvin@gmail.com>', // sender address
        to: 'adquestasia.kelvin@gmail.com', // list of receivers
        subject: '[QR Adquest Asia] [ Send Mail test]', // Subject line
        text: 'Content for Email', // plain text body
        html: '<b>Email for testing QR Team?</b>' // html body
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
};