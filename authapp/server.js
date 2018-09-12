const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose =require('mongoose');
const config = require('./config/config');


//Connect to database
mongoose.connect(config.database, {useMongoClient: true});


//On connection
mongoose.connection.on('connected',()=>{
	console.log('connected to database ' + config.database)
});


//On error
mongoose.connection.on('error',(err)=>{
	console.log('database error ' + err)
});

const app = express();
const users = require('./routes/users');
const devices = require('./routes/devices');
const loginlogs = require('./routes/loginlogs');

//port number
const port = config.port;

//cors middleware
app.use(cors());

//Static folder
app.use(express.static(path.join(__dirname,'public')));


//Body Parser Middleware
app.use(bodyParser.json());
app.use('/users',users);
app.use('/devices',devices);
app.use('/loginlogs',loginlogs);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

//Server routes
app.get('/',(req,res)=>{
	res.send('Invalid Endpoint');
});

//Start Server
app.listen(port, ()=>{
	console.log('Server starting at port '+ port);
});


