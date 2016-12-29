<?php
	function error($e, $code) {
		header('X-Temp: Nothing', false, $code);
		echo $e;
		die();
	}
	
	function isDebug() {
		// return isset($_ENV['TROLLEYMAN_DEBUG']);
		return false;
	}
	
	if (isDebug())
		error_reporting(0); // turn off error reporting
	//header("Access-Control-Allow-Origin: *");
	
	include('lock.php');
	include('name.php');
	include('db.php');
?>