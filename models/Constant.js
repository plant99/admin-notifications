var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

module.exports = mongoose.model('constant', new Schema({
  key: String,
  values: Array
}, { usePushEach: true }));
