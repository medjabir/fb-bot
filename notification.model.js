const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	    fbuserid: { type:Number, required: true },
        messageTimestamp: { type:Number, required: true },
        message: { type:Number, required: true }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
