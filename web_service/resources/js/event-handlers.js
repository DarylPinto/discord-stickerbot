//When the page loads
$(document).ready(function() {

	bindDynamicSearch();
	displayStickers();

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
});