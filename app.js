"use strict";
const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
//impotrt from somewhere
const dbInit = require('./utils/dbInit');
dbInit();
const Notification = require('./models/Notification');
const secretString = "I_am_aw3sOme";
const app = express();
const fs = require('fs');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb'}));
app.use(cookieParser());
app.use(express.static('public'));

//dummy route
app.get('/get_notifications', (req, res) => {
  console.log(req.body);
  Notification.find({}, (err, notifications) => {
    console.log(notifications);
    res.json({success: true, notifications});
  });
});

app.post('/notification', (req, res) => {
  let title = req.body.title;
  let description = req.body.description;
  let category = req.body.category;
  if(!(title && description && category)){
    res.json({success: false, message: 'Send proper parameters'});
  }
  Notification.create({
    title,
    description,
    category
  }, (err, data) => {
    console.log(err, data);
  });
});

app.post('/notify', (req, res) => {
  //notify to firebase
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    console.log(err);
    next(err);
});


app.listen(3002);
