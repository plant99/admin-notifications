var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('user', new Schema({
  username: String,
  name: String,
  muted_topics: Array(String),
  device_token: String
}));
