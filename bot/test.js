var request = require('request');

function stickerInDB(stickerName, cb){

	request({
		url: `http://darylpinto.com/stickerbot/stickers.json?nocache=${(new Date()).getTime()}`,
		json: true
	}, (error, response, body) => {

		if(error) reject(error);
		if (!error && response.statusCode === 200){
			//Store JSON file object
			stickers = body;
			if(typeof stickers[stickerName] === 'string'){
				cb(true);
			}else{
				cb(false);
			}
		}
	});

}

stickerInDB('aoeu', function(result){
	console.log(result);
});