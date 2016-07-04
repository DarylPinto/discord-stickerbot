$('#open-sticker-dialog-btn').click(function(){

	liteModal.open('#add-sticker-dialog');

	$('#add-sticker-dialog input:first-of-type').focus();

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
			$('#submit-sticker input[type="text"]').val('');
		}
	});
	return false;

});

//Show warning if sticker name is already taken or is already an emoji
$('input[name="stickerName"]').blur(function(){

	var name = $(this).val();
	if( emojiList.indexOf( name ) > -1 || Object.keys(stickerData).indexOf( name ) > -1 ){

		$('.name-taken-warning').removeClass('hidden');
		$('#submit-sticker-btn').addClass('unclickable');

	}else{
		$('.name-taken-warning').addClass('hidden');
		$('#submit-sticker-btn').removeClass('unclickable');
	}

});