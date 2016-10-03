$('#open-sticker-dialog-btn').click(function(){

	liteModal.open('#add-sticker-dialog');

});

$('#submit-sticker').submit(function(){	

	$.ajax({
		type: "POST",
		url: "add-sticker.php",
		data: $('#submit-sticker').serialize(),
		success: function(data){
			console.log(data);
			$('main .container').empty();
			displayStickers();
			liteModal.close();
			removeUploadedImage();
		}
	});
	return false;

});

//Show warning if sticker name is already taken or is already an emoji
$('input[name="stickerName"]').blur(function(){

	var name = $(this).val().replace(/:/g, '');

	$('#submit-sticker-btn').addClass('unclickable');
	$('.warning').addClass('hidden');

	if(Object.keys(stickerData).indexOf( name ) > -1 ){
		$('#nametaken-sticker').removeClass('hidden');
	}else if(emojiList.indexOf( name ) > -1){
		$('#nametaken-emoji').removeClass('hidden');
	}else{
		$('#nametaken-sticker, #nametaken-emoji').addClass('hidden');
		$('#submit-sticker-btn').removeClass('unclickable');
	}

});

$('.close-x').click(function(){
	liteModal.close();
});

$(document).ready(function(){
	$('#sticker-search').focus();
});