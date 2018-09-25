const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Device = require('../models/device');
const loginlog = require('../models/loginlog');

/**
 * Register
 */
router.post('/register',(req,res,next)=>{
	let newUser = new User({
		username: req.body.username,
		password: req.body.password,
		IsAdmin:  req.body.isAdmin,
		RfidUID:  req.body.RfidUID
	});
	User.getUserByUsername(newUser.username,(err,user)=>{
		if(err) throw err;
		if(!user){
			User.addUser(newUser,(err,user)=>{
				if(err){
					res.json({success: false, msg: config.ST_Code12});	
				}else{
					res.json({success: true, msg: config.ST_Code13});
					// loginlog.system_log(username + ' ::: ' +config.ST_Code13);
				}
				});
		}else{
			res.json({success: false, msg: config.ST_Code11});	
		}
	});
});

/**
 * Login function
 */
router.post('/authenticate',(req,res,next)=>{
	const username = req.body.username;
	const password = req.body.password;

	User.getUserByUsername(username,(err,user)=>{
		if(err) throw err;
		if(!user){
			return res.json({success: false, msg: config.ST_Code06});
		}
		User.comparePassword(password, user.password, (err, isMatch)=>{
			if(err) throw err;
			if(isMatch){
				const token = jwt.sign(user.toJSON(), config.secret,{
					expiresIn: config.TokenTime
				});
				res.json({
					success: true,
					token: "JWT " + token,
					user:{
						id: user._id,
						username: user.username,
						IsAdmin: user.IsAdmin,
						RfidUID: user.RfidUID
					}
				});
				// loginlog.system_log(username + ' ::: authenticated');
			}else{
				return res.json({success: false, msg: config.ST_Code14});
			}
		});
	});
});

/**
 * Show profile
 */
router.get('/profile',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
	// console.log("JSON: "+req.user);
	res.json({user: req.user});
});

/**
 * Update user info
 */
router.put('/updateprofile',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
	var tempUser = req.user;
	if(tempUser.IsAdmin == true){
		let newUser = new User({
			username: req.body.username,
			IsAdmin:  req.body.isAdmin,
			RfidUID:  req.body.RfidUID
		});
		User.getUserByUsername(newUser.username,(err,user)=>{
			if(err) throw err;
			if(!user){
				return res.json({success: false, msg: config.ST_Code06});
			}else{
				User.updateUser(newUser,(err,user)=>{
					if(err){
						return res.json({success: false, msg: config.ER_Code01});
					}else{
						// loginlog.system_log(username + ' ::: update profile');
						return res.json({success: true, msg: config.ER_Code02});
					}
				})
			}
		});
	}else{
		return res.json({success: false, msg: config.ER_Code03});
	}
});

/**
 * Get list user 
 */
router.get('/listuser',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    User.findall((err,listUser)=>{
        if(err) throw err;
        if(!listUser){
            res.json({Success: false , msg: config.ST_Code06});
        }else{
            res.send(listUser);
        }
    });
});

/**
 * Change Password
 */
router.put('/changepasswd',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
	var newpasswd = req.body.newpassword;
	var oldpassword = req.body.oldpassword;
	var username = req.user.username;
	User.getUserByUsername(username,(err,user)=>{
		if(err) throw err;
		if(!user){
			return res.json({success: false, msg: config.ST_Code06});
		}
		User.comparePassword(oldpassword, user.password, (err, isMatch)=>{
			if(err) throw err;
			if(isMatch){
				User.changepasswd(user.username,newpasswd,(err,user)=>{
					if(err) throw err;
					if(user){
						// loginlog.system_log(username + ' ::: '+config.ST_Code15);
						return res.json({success: true, msg: config.ST_Code15});
					}
				})
			}else{
				return res.json({success: false, msg: config.ST_Code14});
			}
		});
	});
});

/**
 * Delete user
 * Param: userID (request.body._id)
 */
router.post('/removeuser',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
	var userID = req.body._id;
	//Check User exits in Device or not
	console.log('UserID: ' +userID );
	Device.removeUserIDOnAllDevices(userID,(err,device)=>{
		if(err) throw err;
		// Remove user by UserID
		User.removeUser(userID,(err,user)=>{
			if(err) throw err;
			else{
				// loginlog.system_log(_id + ' ::: '+config.ER_Code05);
				return res.json({success: true, msg: config.ER_Code05});
			}
		})
	})
});

module.exports = router;