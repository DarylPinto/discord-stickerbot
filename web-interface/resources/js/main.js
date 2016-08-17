var stickerData;
var emojiList;
var stickerElements = [];
var favorites = [];

//Get value from querystring paramaters
//stackoverflow.com/q/901115
function querystringParam(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//Remove `item` from `arr`
function removeFromArray(arr, value) {
    var what, a = arguments, L = a.length, ax;
    while (L && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

//Store array of HTML strings for each sticker
function storeStickers(key, val){

	stickerElements.push(''+
		'<div class="sticker">' +
			'<i class="fa fa-star" aria-hidden="true"></i>' +
			'<i class="fa fa-star-o" aria-hidden="true" title="Favorite this sticker"></i>' +
			'<div class="image-area" style="background-image: url('+val+')"></div>' +
			'<p>:'+key+':</p>	' +
		'</div>'
	);

}

//Make input at top of page filter stickers
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

//Show stickers on screen
function displayStickers(){
	$.getJSON('stickers.json?nocache=' + (new Date()).getTime(), function(data){

		stickerData = data;

		stickerElements = [];

		$.each(data, storeStickers);

		stickerElements.forEach(function(el){
			$('main .container').prepend(el);
		});

		bindDynamicSearch();
		bindFavoriteStickers();

	});
}

//Favorite/Unfavorite Stickers
function bindFavoriteStickers(){

	//Add sticker
	$('.fa-star-o').click(function(){
		$(this).closest('.sticker').addClass('favorited');
		var stickerName = $(this).siblings('p').text().replace(/:/g, '');
		favorites.push(stickerName);
	});

	//Remove sticker
	$('.fa-star').click(function(){
		$(this).closest('.sticker').removeClass('favorited');
		var stickerName = $(this).siblings('p').text().replace(/:/g, '');
		removeFromArray(favorites, stickerName);
	});

}

//Prepare imgur image to be stored in stickers JSON file
function prepareUploadedImage(img){
	$('input[name="stickerURL"]').val(img);
	$('.dropzone').addClass('hidden');
	$('.status').removeClass('hidden').css('background-image', 'url('+img+')');
}

//Remove imgur image from dialog window
function removeUploadedImage(){
	$('#submit-sticker input[type="text"]').val('');
	$('.dropzone').removeClass('hidden');
	$('.status').addClass('hidden');
}

bindDynamicSearch();
displayStickers();

//Store emoji array
$.getJSON('resources/data/emojis.json', function(data){
	emojiList = data.emojis;
});

//imgur.js upload
new Imgur({

	clientid: '10d33ee9d20ff23',
	callback: function(result){
		if(result.success){
			prepareUploadedImage(result.data.link);
		}
	}

});

$('.status').addClass('hidden');

if( querystringParam('add') != null ){
	$('#open-sticker-dialog-btn').removeClass('hidden');
}