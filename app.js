"use strict";
const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const config = require('./config');
//impotrt from somewhere
const dbInit = require('./utils/dbInit');
dbInit();
const Notification = require('./models/Notification');
const Constant = require('./models/Constant');
const User = require('./models/User');
const secretString = "I_am_aw3sOme";
const app = express();
const fs = require('fs');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb'
}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  let name = req.params.name; //change as per needs
  User.findOne({
    name
  }, function(err, data){
    if(err){
      console.log(err);
    }else{
      if(data){
        //res.render('index', {isAdmin: req.body.X_USER_IS_ADMIN});
        res.render('index', {
          isAdmin: false,
          url: config.url,
          port: config.port
        });
      }else{
        let user = new User({
          name,
          muted_topics: []
        });
        user.save(err => {
          if(err) console.log(err); //send error page here
          res.render('index', {
            isAdmin: false,
            url: config.url,
            port: config.port
          });
        })
      }
    }
  })
})
app.use(express.static('public'));

app.get('/get_notifications', (req, res) => {
  //console.log(req.body);
  Notification.find({}, (err, notifications) => {
    console.log(notifications);
    res.json({
      success: true,
      notifications
    });
  });
});

app.get('/muted_categories', (req, res) => {
  let name = req.query.name;
  if(!name){
    return res.json({success: false, message: "Pass proper params"});
  }
  User.findOne({
    name
  }, (err, data)=>{
    if(err){
      console.log(err);
      res.json({success: false, message: "Internal Server Error"});
    }else{
      res.json({success: true, muted_topics: !data ? [] : data.muted_topics})
    }
  })
});
app.post('/mute', (req, res) => {
  let name = req.body.name;
  let topic = req.body.topic;
  if(!name || !topic){
    return res.json({success: false, message: "Pass proper params"});
  }
  User.findOne({
    name
  }, function(err, data){
    if(err){
      console.log(err);
      res.json({success: false, message: "Internal Server Error"});
    }else{
      if(data){
        data.muted_topics.push(topic);
        data.save(function(err, saved){
          if(err){
            console.log(err); 
            res.json({success: false, message: "Internal Server Error"});
          }else{
            res.json({success: true, message: "Preference saved!"});
          }
        })
      }else{
        res.json({success: false, message: 'User Not found!'});
      }
    }
  });
});
app.post('/unmute', function(req, res){
  let name = req.body.name;
  let topic = req.body.topic;
  User.findOne({
    name
  }, function(err, data){
    if(err){
      console.log(err);
      res.json({success: false, message: "Internal Server Error"});
    }else{
      if(data){
        let topicIndex = data.muted_topics.indexOf(topic);
        if(topicIndex === -1){
          return res.json({success: false, message: "Topic not muted!"});
        }else{
          data.muted_topics.splice(topic, 1);
        }
        data.save(function(err, saved){
          if(err){
            console.log(err); 
            res.json({success: false, message: "Internal Server Error"});
          }else{
            res.json({success: true, message: "Preference saved!"});
          }
        })
      }
    }
  });
})
app.post('/notification', (req, res) => {
  let title = req.body.title;
  let description = req.body.description;
  let category = req.body.category;
  if (!(title && description && category)) {
    res.json({
      success: false,
      message: 'Send proper parameters'
    });
  }
  Notification.create({
    title,
    description,
    category
  }, (err, data) => {
    console.log(err, data);
  });
});
app.post('/category', (req, res) => {
  let name = req.body.name;
  if (!name) {
    res.json({
      success: false,
      message: "Pass with appropriate parameters!"
    });
  }
  Constant.findOne({
    key: 'categories'
  }, function (err, data) {

    //handle error
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: 'Server error!'
      })
    }
    data.values.push(name);
    data.save((err) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Internal Server Error'
        });
      } else {
        return res.json({
          success: true,
          message: 'Category Added!'
        })
      }
    })
  });
});
app.get('/categories', (req, res) => {
  Constant.find({
    key: "categories"
  }, function (err, data) {
    if (err) {
      res.json({
        success: false,
        message: 'Internal Server Error'
      });
    } else {
      res.json({success: true, categories: data[0].values});
    }
  })
})
app.post('/notify', (req, res) => {
  //notify to firebase
});

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  console.log(err);
  next(err);
});


app.listen(3002);