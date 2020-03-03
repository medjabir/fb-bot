const express = require("express");
const mongoose = require("mongoose");
const request = require("request");
const chalk = require("chalk");
require ('dotenv').config();

let User = require(__dirname+'/user.model.js');
let Notification = require(__dirname+'/notification.model.js');

app = express();
app.use(express.json());

app.listen(process.env.PORT || 1337, () => {
	console.log(chalk.bgGreen.black(process.env.BOT_WEBHOOK_ROUTE+' is listening on port :'+process.env.PORT));
}).on('error', (err) => {
	console.log(chalk.bgRed.black('Couldn\'t listen on port : '+process.env.PORT));
});

//DB connection
const db_uri = process.env.DB_URI;
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.once('open', () => {
	console.log(chalk.bgGreen.black('MongoDB connection established'));
});

app.get("/"+"test_"+process.env.BOT_WEBHOOK_ROUTE, (req, res) => { res.send(process.env.BOT_WEBHOOK_ROUTE+' is listening on port :'+process.env.PORT); });

app.post("/"+process.env.BOT_WEBHOOK_ROUTE, (req, res) => {
	let body = req.body;

	if (body.object === "page") {
		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(entry => {

			let webhook_event = entry.messaging[0];
			let times_stamp = webhook_event.timestamp;
			let sender_psid = webhook_event.sender.id;

			// console.log("Sender PSID : " + sender_psid);

			if (webhook_event.game_play) {

				let userTime = Math.round(times_stamp / 1000 / 60) * 1000 * 60;

				var message_time = [];

				message_time[0] = process.env.messageTime1;
				message_time[1] = process.env.messageTime2;
				message_time[2] = process.env.messageTime3;
				message_time[3] = process.env.messageTime4;
				message_time[4] = process.env.messageTime5;
				
				User.findOne({ fbuserid: sender_psid })
				// .then(user => console.log('Old user -> '+sender_psid))
				.then(user => {
					if(user) {
						console.log(chalk.yellow('Old user -> '+sender_psid));
					} else {
						const newUser = new User({
							fbuserid: sender_psid,
							signupTimestamp: userTime
						});
	
						newUser.save().then(() => console.log(chalk.green('New User -> '+sender_psid)));

						for (var i = 0; i < 5; i++) {

							var messageTimestamp = userTime +60000 * parseInt(message_time[i]);
	
							newNotification = new Notification({
								fbuserid: sender_psid,
								messageTimestamp: messageTimestamp,
								message: i
							});
	
							newNotification.save();
						}
					}
				});

			}

		});

		res.status(200).send('EVENT_RECEIVED');

	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});

app.get("/"+process.env.BOT_WEBHOOK_ROUTE, (req, res) => {

  	// Your verify token. Should be a random string.

  	// Parse the query params
  	let mode = req.query["hub.mode"];
  	let token = req.query["hub.verify_token"];
	let challenge = req.query["hub.challenge"];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {
		//Checks the mode and token sent is correct
		if (mode === "subscribe" && token === process.env.VERIFY_TOKEN ) {
			//Responds with the challenge token from the request
			console.log(chalk.bgGreen.black('WEBHOOK_VERIFIED'));
			res.status(200).send(challenge);
		} else {
			//Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}

});

function callSendAPI(sender_psid, response, game_page_access_token) {
	//Construct the message body
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		message: response
	};

	//Send the HTTP request to the Messenger Platform
	request(
		{
			uri: "https://graph.facebook.com/me/messages",
			qs: { access_token: game_page_access_token },
			method: "POST",
			json: true,
			body: request_body
		},
		(err, res, body) => {
			
			if (res.statusCode == 200) {
				console.log(chalk.green("Message sent ! ID: " + sender_psid));
			} else {
				console.error(chalk.bgRed.black('Error : '+body.error.message));
			}
		}
	);
}


function check() {

	let currentTime = Math.round(new Date().getTime() / 1000 / 60) * 1000 * 60;

	// SendMessage('2385604404873137', 0);
	// SendMessage('3877811178910851', 0);

	Notification.find({ messageTimestamp: currentTime })
	.then(notifications => {
		if (notifications) {
			notifications.forEach(notification => {
				SendMessage(notification.fbuserid, notification.message);
				//console.log(notification);
			Notification.findByIdAndDelete({ _id: notification._id });
			});
		}
	})
}

function SendMessage(sender_psid, message) {

	if (message === 0) {
		let response = {
			attachment: {
			  type: "template",
			  payload: {
				template_type: "media",
				elements: [
				  {
					media_type: "video",
					url: process.env.messageImage1,
					buttons: [
					   {
					 	type: "game_play",
					 	title: process.env.messageButtonName1,
					 	payload: JSON.stringify({
					 	  gift: false,
					 	  name: "Nancy",
					 	  id: "",
					 	  bot_coin: 10
					 	})
					   }
					]
				  }
				]
			  }
			}
		};

		  callSendAPI(sender_psid, response, process.env.PAGE_ACCESS_TOKEN);

	} else if (message === 1) {
		let response = {
			attachment: {
			  type: "template",
			  payload: {
				template_type: "generic",
				elements: [
				  {
					title: process.env.messageTitle2,
					image_url: process.env.messageImage2,
					subtitle: process.env.messageSubTitle2,
					default_action: {
					  type: "game_play"
					},
					buttons: [
					  {
						type: "game_play",
						title: process.env.messageButtonName2,
						payload: JSON.stringify({
						  gift: true,
						  name: "Nancy",
						  id: "",
						  bot_coin: 0
						})
					  },
					  {
						type: "web_url",
						url: "https://fb.gg/play/523078621874550",
						title: "More Games"
					  }
					]
				  }
				]
			  }
			}
		  };

		  callSendAPI(sender_psid, response, process.env.PAGE_ACCESS_TOKEN);

	} else if (message === 2) {
		let response = {
			attachment: {
			  type: "template",
			  payload: {
				template_type: "generic",
				elements: [
				  {
					title: process.env.messageTitle3,
					image_url: process.env.messageImage3,
					subtitle: process.env.messageSubTitle3,
					default_action: {
					  type: "game_play"
					},
					buttons: [
					  {
						type: "game_play",
						title: process.env.messageButtonName3,
						payload: JSON.stringify({
						  top: 0
						})
					  },
					  {
						type: "web_url",
						url: "https://fb.gg/play/523078621874550",
						title: "More Games"
					  }
					]
				  }
				]
			  }
			}
		  };

		  callSendAPI(sender_psid, response, process.env.PAGE_ACCESS_TOKEN);

	} else if (message === 3) {
		let response = {
			attachment: {
			  type: "template",
			  payload: {
				template_type: "generic",
				elements: [
				  {
					title: process.env.messageTitle4,
					image_url: process.env.messageImage4,
					subtitle: process.env.messageSubTitle4,
					default_action: {
					  type: "game_play"
					},
					buttons: [
					  {
						type: "game_play",
						title: process.env.messageButtonName4,
						payload: JSON.stringify({
						  bot_data: 0
						})
					  },
					  {
						type: "web_url",
						url: "https://fb.gg/play/523078621874550",
						title: "More Games"
					  }
					]
				  }
				]
			  }
			}
		  };

		  callSendAPI(sender_psid, response, process.env.PAGE_ACCESS_TOKEN);

	} else if (message === 4) {
		let response = {
			attachment: {
			  type: "template",
			  payload: {
				template_type: "generic",
				elements: [
				  {
					title: process.env.messageTitle5,
					image_url: process.env.messageImage5,
					subtitle: process.env.messageSubTitle5,
					default_action: {
					  type: "game_play"
					},
					buttons: [
					  {
						type: "game_play",
						title: process.env.messageButtonName5,
						payload: JSON.stringify({
						  bot_data: 0
						})
					  },
					  {
						type: "web_url",
						url: "https://fb.gg/play/523078621874550",
						title: "More Games"
					  }
					]
				  }
				]
			  }
			}
		  };

		  callSendAPI(sender_psid, response, process.env.PAGE_ACCESS_TOKEN);

	} else {
		let response = {
			text: `Text ${message}`
		};

		callSendAPI(sender_psid, response, process.env.PAGE_ACCESS_TOKEN);
	}
}

module.exports.check = check;
