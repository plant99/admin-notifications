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
var admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(config.firebase_config.serviceAccount),
  databaseURL: "https://admin-notifications-7d944.firebaseio.com"
});
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
  let name = req.headers['x-nitt-app-username']; //change as per needs
  if(!name){
    res.json({success: false, message: "Pass proper params!"});
  }else{
    User.findOne({
      name
    }, function(err, data){
      if(err){
        console.log(err);
      }else{
        let isAdmin = (req.headers['x-nitt-app-is-admin'] === "true");
        Constant.findOne({
          key: "categories"
        })
        .then(constant => {
          console.log(constant);
          let categories =  !constant || constant.values === '' ? [] : constant.values;
          if(data){
            //res.render('index', {isAdmin: req.body.X_USER_IS_ADMIN});
            res.render('index', {
              isAdmin,
              url: config.url,
              port: config.port,
              categories,
              firstTime: false
            });
          }else{
            let user = new User({
              name,
              muted_topics: []
            });
            user.save(err => {
              if(err) console.log(err); //send error page here
              res.render('index', {
                isAdmin,
                url: config.url,
                port: config.port,
                categories,
                firstTime: true
              });
            })
          }
        })
        .catch(err => {
          console.log(err);
          res.json({success: false, message: "Server Error"});
        })
      }
    })   
  }
})
app.use(express.static('public'));

app.get('/get_notifications', (req, res) => {
  //console.log(req.body);
  //console.log(req.headers['x-nitt-app-username']);
  Notification.find({
    $or:[
      {status: true, to : ''}, 
      {status: false, to: req.headers['x-nitt-app-username']}
    ]
  }, (err, notifications) => {
    res.json({
      success: true,
      notifications: notifications
    });
  });
});

app.get('/muted_categories', (req, res) => {
  let name = req.headers['x-nitt-app-username'];
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
  let name = req.headers['x-nitt-app-username'];
  let topic = req.body.topic;
  console.log(name, topic, req.headers, req.body);
  if(!name || !topic){
    console.log('hey');
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
            //subscribe user to a specific topic
          }
        })
      }else{
        res.json({success: false, message: 'User Not found!'});
      }
    }
  });
});
app.post('/unmute', function(req, res){
  let name = req.headers['x-nitt-app-username'];
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
            console.log('Successfully subscribed to topic:', response);
            //unsubscribe user from a specific topic
          }
        })
      }
    }
  });
})
app.post('/add_admin', (req, res) => {
  let name = req.body.name;
  let username = req.body.username;
  Constant.findOne({key: "admins"}, (err, constant) => {
    if(err) return res.json({success: true, message : "Internal Server Error"});
    if(constant){
      let admins = constant.values || [];
      if(admins.findIndex(value => value.username === username) != -1){
        return res.json({success: false, message: "User is already admin"});
      }
      admins.push({name, username});
      constant.values = admins;
      constant.save((err, saved) => {
        if(err){
          return res.json({success: true, message : "Internal Server Error"});
        }else{
          res.json({success: true, message: "Admin added"});
        }
      })
    }else{
      res.json({success: true, message: 'sd'});
      //handle later the case when admins document doesn't exist at all
    }
  })
})
app.post('/remove_admin', (req, res) => {
  let name = req.body.name;
  let username = req.body.username;
  Constant.findOne({key: "admins"}, (err, constant) => {
    if(err) return res.json({success: true, message : "Internal Server Error"});
    if(constant){
      let admins = constant.values || [];
      if(admins.findIndex(value => value.username === username) === -1){
        return res.json({success: false, message: "User doesn\'t exist"});
      }
      admins.splice(admins.indexOf({name, username}), 1);
      constant.values = admins;
      constant.save((err, saved) => {
        if(err){
          return res.json({success: true, message : "Internal Server Error"});
        }else{
          res.json({success: true, message: "Admin removed"});
        }
      })
    }else{
      //handle later the case when admins document doesn't exist at all
      res.json({success: false, message: "User doesn\'t exist!"});
    }
  })
})
app.get('/floating_tokens', (req, res) => {
  if(req.headers['x-nitt-app-is-admin'] === "false"){
    return res.json({success: true, message: "You aren\'t authorized to come here"});
  }
  Notification.find({status: false, to:'' }, (err, notifications) => {
    if(err) return res.json({success: false, message: "Internal Server Error"});
    res.json({success: true, notifications});
  })
})
app.post('/notification_token', (req, res) => {
  let title = req.body.title;
  let description = req.body.description;
  let category = req.body.category;
  if (!(title && description && category)) {
    res.json({
      success: false,
      message: 'Send proper parameters'
    });
  }else{
    Notification.create({
      title,
      description,
      category,
      status: 0,
      to: '',
      author: req.headers['x-nitt-app-username']
    }, (err, data) => {
      res.json({success: true, message: 'Notification requested!'});
      Constant.findOne({key: "admins"}, (err, constant) => {
        let admins = constant.values;
        console.log(admins);
        let notifications = [];
        for(var i=0; i< admins.length; i++){
          console.log(admins[i]);
          let notificationTemplate = {
            title: 'Notification Request',
            description: `${req.headers['x-nitt-app-name']} requested to add a notification, head to dashboard to approve it!`,
            category: 'general', //?
            to: admins[i],
            author: '',
            status: false
          };
          notifications.push(notificationTemplate);
        }
        Notification.create(notifications, function(err, notificationsCreated){
          if(err){
            console.log(err);
          }
        })
      });
      console.log(err, data);
    });
  }
})
app.post('/approve_token', (req, res) => {
  let id = req.body.notif_id;
  Notification.findById(id, (err, notification) => {
    notification.status = 1;
    notification.to = '';
    notification.save(function(err, saved){
      if(err) res.json({success: false, message: "Internal Server Error"});
      else res.json({success: true, message: "approved"});
    });
    addNotificationToFirebase(notification);
    //add notification to group
    //send indivisual notification to user
  })
})
app.post('/discard_token', (req, res) => {
  let id = req.body.notif_id;
  Notification.deleteOne({_id: id}, (err, success) => {
    res.json({success: true, message: 'Deleted'});
    //send reject notification to user
  });
})
app.post('/notification', (req, res) => {
  if(req.headers['x-nitt-app-is-admin'] === "false"){
    return res.json({success: false, message: "Only admins can post notifications!"});
  }
  let title = req.body.title;
  let description = req.body.description;
  let category = req.body.category;
  if (!(title && description && category)) {
    res.json({
      success: false,
      message: 'Send proper parameters'
    });
  }else{
    //add notification to firebase
    const notification = {
      title,
      description,
      category,
      status: 1,
      to: '',
      author: req.headers['x-nitt-app-username']
    };
    Notification.create(notification, (err, data) => {
      res.json({success: true, message: 'Notification added!'})
      addNotificationToFirebase(notification);
      var message = {
        data: {
          score: '850',
          time: '2:45'
        },
        token: "daIshKnLqzw:APA91bEz0t2qOu0VjXhauadLYuUt7pJHjgqj7PIc0steLwpJx23qrCJBSf18wm4dPbA5WnWrwCRUAYygP0L5St4mo-rMh9ouMe8dkFPXv-x4T6s3waztDGsMo7o4ZhsguHyD3Fsm1i4W"
      };

      // Send a message to the device corresponding to the provided
      // registration token.
      admin.messaging().send(message)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });

      console.log(err, data);
    }); 
  }
});
app.post('/category', (req, res) => {
  //subscribe everyone to this category
  let name = req.body.name
  if (!name) {
    res.json({
      success: false,
      message: "Pass with appropriate parameters!"
    });
  }
  Constant.findOne({
    key: 'categories'
  }, function (err, data) {
    console.log(data);
    //handle error
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: 'Server error!'
      })
    }
    data = data && data.values ? data : new Constant({ key: "categories", values: [] });
    data.values.push(name);
    data.save((err) => {
      if (err) {
        console.log(err);
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
      data = (data && data.length) ? data[0].values : [];
      res.json({success: true, categories: data});
    }
  })
})

app.post('/subscribe_all', function(req, res){
  Constant.find({
    key: "categories"
  }, function (err, data) {
    if (err) {
      res.json({
        success: false,
        message: 'Internal Server Error'
      });
    } else {
      User.update({
        name:req.headers['x-nitt-app-username']
      },{
        device_token: req.body.token
      }, (err, data) => {
        if(!err){
          data = (data && data.length) ? data[0].values : [];
          for(let i=0; i<data.length; i++){
            //subscribe to each topic
          }
          //wait for promises to resolve
          //following response is dummy
          res.json({success: true})
        }
      })
      
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


function addNotificationToFirebase(notification){
  //` The topic name can be optionally prefixed with "/topics/".
  var topic = notification.category;
  
  // See documentation on defining a message payload.
  var message = {
    data: {
      topic,
      title: notification.title,
      description: notification.description
    },
    topic
  };
  
  // Send a message to devices subscribed to the provided topic.
  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}
