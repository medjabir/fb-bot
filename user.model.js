const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	    fbuserid: { type:Number, required: true },
	    signupTimestamp: { type:Number, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
