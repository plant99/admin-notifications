var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('notification', new Schema({
  title: String,
  description: String,
  to: String,
  category: {
    type: String
  },
  status: Boolean, //0 for not accepted, 1 for accepted,
  author: String
}))
