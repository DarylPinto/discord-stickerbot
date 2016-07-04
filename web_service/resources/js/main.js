var stickerData;
var emojiList;
var stickerElements = [];

function storeStickers(key, val){

	stickerElements.push(''+
		'<div class="sticker">' +
			'<div class="image-area" style="background-image: url('+val+')"></div>' +
			'<p>:'+key+':</p>	' +
		'</div>'
	);

}

function bindDynamicSearch(){
	$('#sticker-search').on('keyup', function(){
		var filter = this.value.toLowerCase().trim();

		$('.sticker p').each(function(){
			if( this.textContent.indexOf(filter) === -1 ){
				$(this).closest('.sticker').addClass('hidden');
			}else{
				$(this).closest('.sticker').removeClass('hidden');
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