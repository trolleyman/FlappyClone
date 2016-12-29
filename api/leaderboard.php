<?php
	include('../lib/common.php');
	
	$conn = getConnection();
	
	$leaderboard = getLeaderboard($conn);
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		echo json_encode($leaderboard);
		$conn->close();
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
		
		// submit score
		submitBestScore($conn, $name, $score);
		
		echo 'Success.'; // everything is ok.
		$conn->close();
	}
?>