'use strict';

let Discord = require('discord.js'),
    fs = require('fs'),
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
	fs.writeFile(`./crash-logs/${crashtype}-${getTimestamp(new Date())}.txt`,	error, 'utf8', (err) => {
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
function download(uri, stickerName){
return new Promise(function(resolve, reject){

  let path = `cache/temp/${stickerName}.png`;

	request.head(uri, (err, res, body) => {
		if(err) reject(err);
		request(uri).pipe(fs.createWriteStream(filename)).on('close', () => {
			resolve({sticker: stickerName});	
		});
	});

});	
}

function stickerExists(stickerKey){
	let stickerExists = true; //SHOULD BE FALSE TO START WITH
	request({
		url: `http://darylpinto.com/stickerbot/stickers.json?nocache=${getTimestamp(new Date())}`,
		json: true
	}, function(error, response, body){

		if(error) throw error;
		if (!error && response.statusCode === 200){
			//Store JSON file object
			stickers = body;
			if( typeof stickers[stickerKey] === 'string' ){
				stickerExists = true;	
			}
		}

	});
	return stickerExists;
}

function cacheStickerAndPost(stickerKey, message){
  console.log(`Caching sticker: ${stickerKey}`);

  let cachePath = `cache/${stickerKey}.png`;

	download(stickers[stickerKey], tempPath, function(){
		gm(tempPath)
		.resize(350, 350)
		.noProfile()
		.write(cachePath, function(err) {
			if(err) throw err;
		  postSticker(stickerKey, message);
		  fs.unlink(tempPath);
		});
	});
}

function postSticker(stickerKey, message){
	let cachePath = `cache/${stickerKey}.png`;
	bot.sendFile(
		stickerKey,
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

		let stickerKey = messageContent.replace(/:/g, '');

		download('http://i.imgur.com/IEZZE5F.png', 'cache/temp/sticker.png')
			.then(function(ob){
        console.log(ob.data + ' ayyyyy we gotem');
      });

		/*if( stickerExists(stickerKey) ){
			if( !pathExists(`cache/${stickerKey}.png`) ){ cacheStickerAndPost(stickerKey, message) }
			else{	postSticker() }
		}*/

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