
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
					.resize(350>)
					.noProfile()
					.write(compressedPath, function (err) {
						if(err) throw err;
					  bot.sendFile(triggerMessage, compressedPath, compressedPath, '**' + getAuthorDisplayName(triggerMessage) + ':**', () => console.timeEnd('Sticker Response Time'));
					});

				});

			}else{

				bot.sendFile(triggerMessage, compressedPath, compressedPath, '**' + getAuthorDisplayName(triggerMessage) + ':**', () => console.timeEnd('Sticker Response Time'));

			}
		}
	}
}