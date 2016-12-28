<?php
	//error_reporting(0); // turn off error reporting
	//header("Access-Control-Allow-Origin: *");
	
	// NB: If moving this file, correct this path.
	const LEADERBOARD_PATH = __DIR__ . '\\..\\..\\PrivateData\\leaderboard.json';
	
	include('lock.php');
	include('name.php');
?>