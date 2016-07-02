var stickerData;
var stickerElements = [];

$.getJSON('stickers.json?nocache=' + (new Date()).getTime(), function(data){

	stickerData = data;

	$.each(data, function(key, val){

		stickerElements.push('<div class="pure-u-1 pure-u-md-1-4 sticker-wrap">' +
				'<div class="sticker">' +
					'<img src="'+val+'">' +
					'<h3>:'+key+':</h3>	' +
				'</div>' +
			'</div>'
		);

	});

	stickerElements.forEach(function(el){
		$('main .container').prepend(el);
	});

});