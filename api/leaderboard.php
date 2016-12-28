<?php
	include('../lib/common.php');
	
	function error($e, $code) {
		header('X-Temp: Nothing', false, $code);
		echo $e;
		unlockFile(LEADERBOARD_PATH);
		die();
	}
	
	if (!file_exists(LEADERBOARD_PATH)) {
		mkdir(dirname(LEADERBOARD_PATH), 0755, TRUE);
		file_put_contents(LEADERBOARD_PATH, "[]");
	}
	
	lockFile(LEADERBOARD_PATH);
	$leaderboardStr = '';
	$leaderboardStr = file_get_contents(LEADERBOARD_PATH);
	if ($leaderboardStr === FALSE)
		error('Could not read leaderboard.json.', 500);
	
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		echo $leaderboardStr;
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		$leaderboard = json_decode($leaderboardStr, true);
		if ($leaderboard === NULL)
			error('Could not decode leaderboard.json.', 500);
		
		// validate arguments
		$name = '';
		$reason = 'name is an empty string';
		if (!isset($_POST['name']) || !isLegalName($_POST['name'], $reason)) {
			error("Illegal name: $reason.", 400);
		} else {
			$name = $_POST['name'];
		}
		
		$score = 0;
		if (!isset($_POST['score'])) {
			error('Invalid score.', 400);
		} else {
			$score = intval($_POST['score']);
			if ($score <= 0) {
				error('Invalid score.', 400);
			}
		}
		
		// find position of user
		$pos = -1;
		for ($i = 0; $i < NUM_LEADERBOARD_ENTRIES; $i++) {
			if (!isset($leaderboard[$i]) || $score > $leaderboard[$i]['score']) {
				$pos = $i;
				break;
			}
		}
		
		if ($pos === -1) {
			error('Not good enough.', 400);
		}
		
		// write score to leaderboard
		$e = array(array('name' => $name, 'score' => $score));
		array_splice($leaderboard, $pos, 0, $e);
		
		// truncate leaderboard
		$len = count($leaderboard);
		if ($len > NUM_LEADERBOARD_ENTRIES) {
			$leaderboard = array_slice($leaderboard, 0, NUM_LEADERBOARD_ENTRIES);
		}
		
		// write leaderboard to file
		$json = json_encode($leaderboard);
		if ($json === FALSE) {
			error('Could not encode leaderboard.json', 500);
		}
		if (file_put_contents(LEADERBOARD_PATH, $json) === FALSE) {
			error('Could not write leaderboard.json', 500);
		}
		
		echo 'Success.'; // everything is ok.
	}
	unlockFile(LEADERBOARD_PATH);
?>