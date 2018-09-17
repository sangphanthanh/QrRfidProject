const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

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
					res.json({success: false, msg: 'Fail to register'+ err});	
				}else{
					res.json({success: true, msg: 'User registered'});
				}
				});
		}else{
			res.json({success: false, msg: 'Username already added'});	
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
			return res.json({success: false, msg: 'User not found'});
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
			}else{
				return res.json({success: false, msg: 'Wrong password'});
			}
		});
	});
});

/**
 * Show profile
 */
router.get('/profile',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
	console.log("JSON: "+req.user);
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
				return res.json({success: false, msg: 'User not found'});
			}else{
				User.updateUser(newUser,(err,user)=>{
					if(err){
						return res.json({success: false, msg: 'Update Error'});
					}else{
						return res.json({success: true, msg: 'Update Success'});
					}
				})
			}
		});
	}else{
		return res.json({success: false, msg: 'Permission require'});
	}
});

/**
 * Get list user 
 */
router.get('/listuser',passport.authenticate('jwt',{session:false}),(req,res,next)=>{
    User.findall((err,listUser)=>{
        if(err) throw err;
        if(!listUser){
            res.json({Success: false , msg: 'Empty'});
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
			return res.json({success: false, msg: 'User not found'});
		}
		User.comparePassword(oldpassword, user.password, (err, isMatch)=>{
			if(err) throw err;
			if(isMatch){
				User.changepasswd(user.username,newpasswd,(err,user)=>{
					if(err) throw err;
					if(user){
						return res.json({success: true, msg: 'Password has been change'});
					}
				})
			}else{
				return res.json({success: false, msg: 'Wrong password'});
			}
		});
	});
});
module.exports = router;