'use strict';

var Discord = require('discord.js');
var fs = require('fs');
var gm = require('gm');
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
 * Get timestamp from date
 * @date {date object}
 * @returns {string} timestamp in format YYYY-MM-D-H-M-S-MS 
 */
function getTimestamp(date){
	let d = date;
	return [
		d.getFullYear(),
		d.getMonth() + 1,
		d.getDate(),
		d.getHours(),
		d.getMinutes(),
		d.getSeconds(),
		d.getMilliseconds()
	].join('-');
}

/**
 * Check if file with path `filename` exists 
 * @returns {boolean} 
 */
function fileExists(filename) {
  try {
    fs.accessSync(filename);
    return true;
  } catch(ex) {
    return false;
  }
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
    console.log('\n');

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
		url: 'http://darylpinto.com/stickerbot/stickers.json?nocache=' + getTimestamp(new Date()),
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
		var cachePath = `cache/${stickerKey}.png`;
		var compressedPath = `cache/compressed/${stickerKey}.png`;

		if(typeof stickers[stickerKey] === 'string'){


			console.time('Sticker Response Time');
			//Delete the message that triggered the response
			bot.deleteMessage(triggerMessage);

			//Post Sticker
			if( !fileExists(cachePath) ){

				download(stickers[stickerKey], cachePath, function(){
					
					gm(cachePath)
					.resize(350, 350)
					.noProfile()
					.write(compressedPath, function (err) {
					  bot.sendFile(triggerMessage, compressedPath, compressedPath, '**' + getAuthorDisplayName(triggerMessage) + ':**', () => console.timeEnd('Sticker Response Time'));
					});

				});

			}else{

				bot.sendFile(triggerMessage, compressedPath, compressedPath, '**' + getAuthorDisplayName(triggerMessage) + ':**', () => console.timeEnd('Sticker Response Time'));

			}
		}
	}
}

bot.on('message', function(message){
	//For bot to respond, trimmed message must:
	// - Start and end with :
	// - Have between 1 and infinite letter/number characters
	if( /^:[a-z0-9]+:$/.test( message.content.trim() ) ){
	
		message.content = message.content.toLowerCase();
		respondTo(message);
		
	}

});

bot.login(credentials.email, credentials.password)
	.then(function(token){
		console.log('Successfully logged in!\n');	
	})
	.catch(function(error){
		fs.writeFile(`./crash-logs/loginfailure-${getTimestamp(new Date())}.txt`,	error, 'utf8', (err) => {
			if(err) throw err; 
			console.log('ERROR: Unable log in!\nCheck the crash logs for a detailed report.');
		});
	});