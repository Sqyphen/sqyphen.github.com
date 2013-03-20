<?php

$photoArr = array();
$photoPosArr = array(array(6, 42),
						array(156, 42),
						array(6, 192),
						array(156, 192));


define('UPLOAD_DIR', '../uploads/');

$img1 = $_POST['img1'];
$img2 = $_POST['img2'];
$img3 = $_POST['img3'];
$img4 = $_POST['img4'];

array_push($photoArr, $img1);
array_push($photoArr, $img2);
array_push($photoArr, $img3);
array_push($photoArr, $img4);

$template = imagecreatefrompng('../assets/img/template.png');
imagealphablending( $template, false );
imagesavealpha( $template, true );

$i = 0;
foreach($photoArr as $p)
{
	$photoResize = imagecreatetruecolor(191, 143);


	$photo = imagecreatefrompng($p);
	//imagecopyresampled($photoResize, $photo, 0, 0, 0, 0, 320, 240, 1024, 768);
	imagecopyresampled($photoResize, $photo, 0, 0, 200, 80, 254, 143, 1024, 576);


	imagecopymerge($template, $photoResize,
						$photoPosArr[$i][0], $photoPosArr[$i][1],
						30, 0, 143, 143, 100);

	imagedestroy($photo);
	$i++;
}

$uid = uniqid();
imagepng($template, UPLOAD_DIR . $uid . '.png');
imagedestroy($template);

echo $uid;
return;

?>