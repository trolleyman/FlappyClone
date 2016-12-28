<?php
	error_reporting(0); // turn off error reporting
	header("Access-Control-Allow-Origin: *");
	
	const LEADERBOARD_PATH = "C:/priv/leaderboard.json";
	
	include('lock.php');
	include('name.php');
?>