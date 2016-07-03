<?php

	$stickerName = strtolower($_POST['stickerName']);
	$stickerURL = $_POST['stickerURL'];

	$stickerJSON = file_get_contents('stickers.json');

	$stickers = json_decode($stickerJSON, true);

	$stickers[$stickerName] = $stickerURL;

	$json = json_encode($stickers);

	file_put_contents('stickers.json', $json);

?>