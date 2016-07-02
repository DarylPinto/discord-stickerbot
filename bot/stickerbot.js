var Discord = require('discord.js');
var request = require('request');
var credentials = require('./login-info.json');

var bot = new Discord.Client();
var commandSymbol = ':';
var triggerMessage;
var stickers;

//return nickname of sender, if no nickname, return username
function getAuthorDisplayName(message){
	return message.channel.server.detailsOf(message.author).nick || message.author.username;
}


function readStickerDB(error, response, body){

	if(error) console.log(error);
	if (!error && response.statusCode === 200){
		//Store JSON file object
		stickers = body;
	}
	postSticker();

}

function postSticker(){

	var message = triggerMessage;

	var stickerKey = message.content.slice(1, message.content.length - 1);
	if(typeof stickers[stickerKey] === 'string'){

		//Delete the message that triggered the response
		bot.deleteMessage(message);
		//Change nickname to match user who posted the message
		bot.setNickname(message, getAuthorDisplayName(message), function(){
				//Post sticker
				bot.sendMessage(message, stickers[stickerKey], function(){
					//Change nickname back to stickerbot
					bot.setNickname(message, 'stickerbot');
				});
		});
	}

}

bot.on('message', function(message){
	//If first and last characters are `commandSymbol`
	if(message.content[0] === commandSymbol &&
		 message.content[message.content.length - 1] === commandSymbol ){
		
		//Save message as global variable for use in another function
		triggerMessage = message;

		//Check JSON file online for stickers
		request({
			url: 'http://darylpinto.com/stickerbot/stickers.json?nocache=' + (new Date()).getTime(),
			json: true
		}, readStickerDB);

	}
});

bot.login(credentials.email, credentials.password, function(){
	console.log('Logged in!');
});