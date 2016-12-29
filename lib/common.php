<?php
	if (!isset($_ENV['TROLLEYMAN_DEBUG']))
		error_reporting(0); // turn off error reporting
	//header("Access-Control-Allow-Origin: *");
	
	function error($e, $code) {
		header('X-Temp: Nothing', false, $code);
		echo $e;
		die();
	}
	
	include('lock.php');
	include('name.php');
	include('db.php');
?>