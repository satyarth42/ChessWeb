var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    first:{
        type: String,
        required: true
    },
    last:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    points:Number
},{collection:'users'});

module.exports = mongoose.model('users', userSchema);