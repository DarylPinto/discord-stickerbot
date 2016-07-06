var Discord = require('discord.js');
var fs = require('fs');
var fileExists = require('file-exists');
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

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function readStickerDB(error, response, body){

	if(error) console.log(error);
	if (!error && response.statusCode === 200){
		//Store JSON file object
		stickers = body;
	}
	postSticker();

}

function deleteLocalSticker(stickerFile){
	if( fileExists(sticerFile) ){
		fs.unlink(stickerFile);
		console.log('Sticker Deleted\n');
	}
}

function postSticker(){

	var message = triggerMessage;

	var stickerKey = message.content.slice(1, message.content.length - 1);
	if(typeof stickers[stickerKey] === 'string'){

		//Delete the message that triggered the response
		bot.deleteMessage(message);

		//Downlaod sticker from imgur
		var stickerFile = stickerKey+'.png';

		download(stickers[stickerKey], stickerFile, function(){

		  console.log('Sticker Downloaded');
			//Post sticker
		  bot.sendFile(message, stickerFile, stickerFile, '**'+getAuthorDisplayName(message)+':**', function(){
		  	if( fileExists(sticerFile) ){
		  		fs.unlink(stickerFile);
		  	}
		  });

		});

		console.log('\n')

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