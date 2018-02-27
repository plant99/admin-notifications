var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('user', new Schema({
  id: Number,
  name: String,
  muted_topics: Array(String)
}));
