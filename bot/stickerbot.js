var Discord = require('discord.js');
var fs = require('fs');
var request = require('request');
var credentials = require('./login-info.json');

var bot = new Discord.Client();
var commandSymbol = ':';
var triggerMessage;
var stickers;

/**
 * Returns user's display name
 * @message {Message object} Message sent by user
 * @returns {string} message author's display name
 */
function getAuthorDisplayName(message){
	return message.channel.server.detailsOf(message.author).nick || message.author.username;
}

/**
 * Downloads an image from a link
 * @uri {string} direct image link 
 * @filename {string} filename to save image as
 * @callback {function} callback function
 */
function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};


/**
 * Stores sticker data 
 */
function readStickerDB(error, response, body){

	if(error) console.log(error);
	if (!error && response.statusCode === 200){
		//Store JSON file object
		stickers = body;
	}
	postSticker();

}

/**
 * Sends sticker to discord text channel
 */
function postSticker(){

	var message = triggerMessage;

	var stickerKey = message.content.slice(1, message.content.length - 1);
	if(typeof stickers[stickerKey] === 'string'){

		var filename = stickerKey + '.png';

		//Delete the message that triggered the response
		bot.deleteMessage(message);
		//Post sticker
		download(stickers[stickerKey], filename, function(){
		  bot.sendFile(message, filename, filename, '**' + getAuthorDisplayName(message) + ':**', () => console.log('Sticker sent!\n') );
		});

	}

}

bot.on('message', function(message){
	//If first and last characters are `commandSymbol`
	if(message.content[0] === commandSymbol &&
		 message.content[message.content.length - 1] === commandSymbol ){
	
		message.content = message.content.toLowerCase();

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