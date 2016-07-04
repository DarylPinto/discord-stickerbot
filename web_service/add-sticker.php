<?php

	function endsWith($haystack, $needle) {
		// search forward starting from end minus needle length characters
		return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== false);
	}

	//POST variables
	$stickerName = strtolower($_POST['stickerName']);
	$stickerURL = $_POST['stickerURL'];

	//Remove any non-numbers or non-lowercase letters from stickerName
	$stickerName = preg_replace('/[^a-z0-9]/', '', $stickerName);

	//check JSON file
	$stickerJSON = file_get_contents('stickers.json');
	$stickers = json_decode($stickerJSON, true);

	//Add to JSON file if stickerName doesn't already exist, and stickerURL contains .jpg or .png
	if( !isset($stickers[$stickerName]) && preg_match('/(\.png|\.jpg|\.jpeg)/', $stickerURL) ){
		$stickers[$stickerName] = $stickerURL;	
	}
	
	//Save JSON file
	$json = json_encode($stickers);
	file_put_contents('stickers.json', $json);

?>