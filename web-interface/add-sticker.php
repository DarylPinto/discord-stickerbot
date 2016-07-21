<?php

	//POST variables
	$stickerName = strtolower($_POST['stickerName']);
	$stickerURL = $_POST['stickerURL'];

	//Remove any non-numbers or non-lowercase letters from stickerName
	$stickerName = preg_replace('/[^a-z0-9]/', '', $stickerName);

	//check stickers JSON file
	$stickerJSON = file_get_contents('stickers.json');
	$stickers = json_decode($stickerJSON, true);

	//check emoji JSON file
	$emojiJSON = file_get_contents('resources/data/emojis.json');
	$emojis = json_decode($emojiJSON, true);

	//Add to JSON file if stickerName doesn't already exist, isn't taken by an emoji, and stickerURL contains .jpg or .png
	if( !isset($stickers[$stickerName]) && !in_array($stickerName, $emojis['emojis'] ) && preg_match('/(\.png|\.jpg|\.jpeg)/', $stickerURL) ){
		$stickers[$stickerName] = $stickerURL;	
	}
	
	//Save JSON file
	$json = json_encode($stickers);
	file_put_contents('stickers.json', $json);

?>