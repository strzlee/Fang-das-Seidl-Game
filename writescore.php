<?php

	$temp[] = $_GET;
	
	$handle = fopen("highscore.json","a+");
	$score = fread($handle, filesize("highscore.json"));
	fclose($handle);
	
	$arr = json_decode($score,true);
	$new = array_merge($arr,$temp);
	
	$name = array();
	$score = array();
	
	foreach ($new as $key => $row) {
    	$name[$key]    = $row['name'];
    	$score[$key] = $row['score'];
	}
	
	array_multisort($score,SORT_DESC,$name,SORT_ASC,$new);
	
	$handle = fopen("highscore.json","w+");
	fwrite($handle,json_encode($new));	
	fclose($handle);
	
	echo json_encode($new);
?>