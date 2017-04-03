var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var readySchema = new Schema({
    _id:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    points:Number
},{collection:'ready'});

module.exports = mongoose.model('ready', readySchema);