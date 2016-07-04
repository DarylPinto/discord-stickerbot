var stickerData;
var emojiList;
var stickerElements = [];

function storeStickers(key, val){

	stickerElements.push('<div class="pure-u-1 pure-u-sm-1-2 pure-u-lg-1-4 sticker-wrap">' +
			'<div class="sticker">' +
				'<div class="image-wrap">' +
					'<img src="'+val+'">' +
				'</div>' +
				'<h3>:'+key+':</h3>	' +
			'</div>' +
		'</div>'
	);

}

function bindDynamicSearch(){
	$('#sticker-search').on('keyup', function(){
		var filter = this.value.toLowerCase().trim();

		$('.sticker-wrap h3').each(function(){
			if( this.textContent.indexOf(filter) === -1 ){
				$(this).closest('.sticker-wrap').addClass('hidden');
			}else{
				$(this).closest('.sticker-wrap').removeClass('hidden');
			}
		});

	});
}

function displayStickers(){
	$.getJSON('stickers.json?nocache=' + (new Date()).getTime(), function(data){

		stickerData = data;

		stickerElements = [];

		$.each(data, storeStickers);

		stickerElements.forEach(function(el){
			$('main .container').prepend(el);
		});

		bindDynamicSearch();

	});
}


bindDynamicSearch();

displayStickers();

$.getJSON('emojis.json', function(data){
	emojiList = data.emojis;
});