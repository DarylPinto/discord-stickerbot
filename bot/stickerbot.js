'use strict';

let Discord = require('discord.js'),
		fs = require('fs'),
		fsp = require('fs-promise'),
		mv = require('mv'),
		gm = require('gm'),
		request = require('request'),
		rp = require('request-promise'),
		credentials = require('./login-info.json'),
		bot = new Discord.Client(),
		stickers = null;

/**
 * Returns user's display name
 * @message {Message object} Message sent by user
 * @returns {string} message author's display name
 */
function getAuthorDisplayName(message){
	return message.channel.server.detailsOf(message.author).nick || message.author.username;
}

function crash(error, crashtype, message){
	crashtype = crashtype || 'crash';
	message = message || error;

	if( !pathExists('crash-logs') ) fs.mkdirSync('crash-logs');
	fs.writeFile(`./crash-logs/${crashtype}-${getTimestamp(new Date())}.log`,	error, 'utf8', (err) => {
		if(err) throw err; 
		console.log(`${message}\nCheck the crash logs for more details.`);
	});
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
function pathExists(path) {
	try {
		fs.accessSync(path);
		return true;
	} catch(ex) {
		return false;
	}
}

/**
 * Downloads an image from a link
 * @uri {string} direct image link 
 * @stickerName {string} name to download sticker as
 * @returns {Promise}
 */
function download(stickerName){
return new Promise(function(resolve, reject){

	let path = `cache/temp/${stickerName}.png`;
	let uri = stickers[stickerName];

	request.head(uri, (err, res, body) => {
		if(err) reject(err);
		request(uri).pipe(fs.createWriteStream(path)).on('close', () => {
			resolve();	
		});
	});

});
}

function stickerInDB(stickerName){
return new Promise(function(resolve, reject){

	request({
		url: `http://darylpinto.com/stickerbot/stickers.json?nocache=${getTimestamp(new Date())}`,
		json: true
	}, (error, response, body) => {

		if(error) reject(error);
		if (!error && response.statusCode === 200){
			//Store JSON file object
			stickers = body;
			if(typeof stickers[stickerName] === 'string'){
				resolve(true);
			}else{
				resolve(false);
			}
		}
	});

});
}

function resizeSticker(stickerName, size){
return new Promise(function(resolve, reject){

	let image = gm(`cache/temp/${stickerName}.png`);

	image
	.resize(size, size)
	.noProfile()
	.write(`cache/${stickerName}.png`, (err)=>{
		if(err) crash(err);
		resolve();
	});

});
}

function cacheSticker(stickerName){
return new Promise(function(resolve, reject){

	let image = gm(`cache/temp/${stickerName}.png`);

	image.size(function(err, size){

		if(err) crash(err);
		if(size.width > 350 || size.height > 350){
			resizeSticker(stickerName, 350)
			.then(function(){
				fs.unlink(`cache/temp/${stickerName}.png`, resolve);
			});

		}
		else mv(`cache/temp/${stickerName}.png`, `cache/${stickerName}.png`, resolve);

	});

});
}

function postSticker(stickerName, message){
	let cachePath = `cache/${stickerName}.png`;
	bot.sendFile(
		stickerName,
		cachePath,
		cachePath,
		`**${getAuthorDisplayName(message)}:**`
	);
}

bot.on('message', function(message){

	let messageContent = message.content.trim().toLowerCase();

	//For bot to respond, trimmed, lowercased message must:
	// - Start and end with :
	// - Have between 1 and infinite letter/number characters
	if( /^:[a-z0-9]+:$/.test(messageContent) ){	

		let stickerName = messageContent.replace(/:/g, '');

		stickerInDB(stickerName)
		.then(function(exists){

			if(exists){
				download(stickerName)
				.then(function(){
					cacheSticker(stickerName);
				})
				.then(function(){
					console.log(`Cached "${stickerName}" sticker`);
				})   
			}

		});

		/*stickerIsCached(stickerName)
			postSticker()*/

	}
});

bot.login(credentials.email, credentials.password)
	.then(function(token){

		if( !pathExists('cache') ) fs.mkdirSync('cache');
		if( !pathExists('cache/temp') ) fs.mkdirSync('cache/temp');

		console.log('Successfully logged in!\n');
	})
	.catch(function(error){
		crash(error, 'loginfailure', 'Unable to login!');
	});