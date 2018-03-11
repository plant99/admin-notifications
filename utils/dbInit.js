
var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;
module.exports = function(){
	mongoose.connect('mongodb://localhost/admin_notifications') ;
	var db = mongoose.connection ;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open',function(){
    	console.log('Connected')
    })

}
 