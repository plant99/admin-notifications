"use strict";
var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;
const Notification = require('../models/Notification');
const Constant = require('../models/Constant');
const User = require('../models/User');
module.exports = function(){
	mongoose.connect('mongodb://localhost/admin_notifications') ;
	var db = mongoose.connection ;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open',function(){
    	console.log('Connected')
    })
    //check
    Constant.findOne({
			key: 'categories'
		}, (err, value) =>{
			if(!value){
				Constant.create({
					key: 'categories',
					value: []
				}, function(err, value){
					if(err){
						console.log(err);
					}
				});
			}
		})
		let name = '123847', username = '234kjhsf';
		User.findOne({name, username}, (err, data)=>{
			if(!data){
				console.log(name, username);
				User.create({
					name,
					username,
					muted_topics: []
				}, function(err, data){
					console.log(data);
					if(err) console.log(err); 
				})
			}
		})
		Constant.findOne({
			key: 'admins'
		}, (err, value) => {
			if(err){console.log(err);}
			if(!value){
				console.log(username, name);
				Constant.create({
					key: 'admins',
					values:[{name, username}]
				}, (err, data) => {
					if(err) console.log(err);
				})
			}
		})
}
 
