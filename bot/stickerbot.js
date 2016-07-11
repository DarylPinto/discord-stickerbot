var Discord = require('discord.js');
var fs = require('fs');
var request = require('request');
var credentials = require('./login-info.json');

var bot = new Discord.Client();
var commandSymbol = ':';

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
 * Responds to a message
 * @triggerMessage {Message object} message that triggered the bot 
 */
function respondTo(triggerMessage){

	var stickers;

	//Check JSON file online for stickers
	request({
		url: 'http://darylpinto.com/stickerbot/stickers.json?nocache=' + (new Date()).getTime(),
		json: true
	}, readStickerDB);

	/**
	 * Store sticker data 
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

		var stickerKey = triggerMessage.content.slice(1, triggerMessage.content.length - 1);

		if(typeof stickers[stickerKey] === 'string'){

			var filepath = 'stickercache/' + stickerKey + '-' + (new Date()).getTime() + '.png';

			//Delete the message that triggered the response
			console.time('Sticker Response Time');
			bot.deleteMessage(triggerMessage);
			//Post sticker
			download(stickers[stickerKey], filepath, function(){
			  bot.sendFile(triggerMessage, filepath, filepath, '**' + getAuthorDisplayName(triggerMessage) + ':**', () => fs.unlink(filepath, () => {
			  	console.timeEnd('Sticker Response Time'); console.log('\n')
			  }) );
			});
		}
		
	}

}

bot.on('message', function(message){
	//If first and last characters are `commandSymbol`
	if(message.content[0] === commandSymbol &&
		 message.content[message.content.length - 1] === commandSymbol ){
	
		message.content = message.content.toLowerCase();

		respondTo(message);
		
	}

});

bot.login(credentials.email, credentials.password, function(){
	console.log('Logged in!\n');
});