const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require ('dotenv').config();

//app = express().use(bodyParser.json());
app = express();
app.use(express.json());

app.listen(process.env.PORT || 1337, () => console.log("Server running 1337"));

//DB connection
const db_uri = process.env.DB_URI;
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.once('open', () => {
	console.log('MongoDB connection established');
});

let User = require(__dirname+'/user.model.js');
let Notification = require(__dirname+'/notification.model.js');

// User.find({ fbuserid: '123'}).then(user => console.log(user));

/* const newUser = new User({
	fbuserid: 897897897897,
	signupTimestamp: 00000000000,
	notifications: [
    ]
});

newUser.save().then(() => console.log('New user added')).catch(err => console.log('Error : '+err)); */

/* const newNotification = new Notification({
	fbuserid: 897897897897,
	messageTimestamp: 00000000000,
	message: 1
});

newNotification.save().then(() => console.log('New Notf added')).catch(err => console.log('Error : '+err)); */

/* User.find(function(err, users) {
    if(err) return console.error(err);

    if (users) {
        users.forEach(user => {
            UserData.push(user);
            console.log(user.fbuserid);
        });
    }

    //console.log(UserData[0]);
}); */

Notification.deleteOne({ fbuserid: 897897897897, messageTimestamp: 5555555, message: 5 })
.then(() => console.log('Deleted !')).catch(err => console.log('Not deleted'));
