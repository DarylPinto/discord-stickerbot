//When the page loads
$(document).ready(function() {

	$('#sticker-search').change(function(){
		var filter = this.value;

		$('.sticker-wrap h3').each(function(){
			if( this.textContent.indexOf(filter) > -1 ){
				$(this).closest('.sticker-wrap').removeClass('hidden');
			}else{
				$(this).closest('.sticker-wrap').addClass('hidden');
			}
		});

	});

});

//When the window is Resized
$(window).resize(function() {
});

//When the page scrolls
$(window).scroll(function() {
});
