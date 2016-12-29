<?php
	function getConnection() {
		$servername = 'localhost';
		$username = 'root';
		$db = 'FlappyClone';
		
		// create connection
		$conn = new mysqli($servername, $username);
		
		// check connection
		if ($conn->connect_errno) {
			error('SQL Error: ' . $conn->connect_error, 500);
		}
		
		// select db
		if (!$conn->select_db($db)) {
			error('SQL Error: ' . $conn->error, 500);
		}
		return $conn;
	}
	
	function getLeaderboard($conn) {
		$sql = 'SELECT * FROM Leaderboard ORDER BY score DESC LIMIT 10;';
		$result = $conn->query($sql);
		if ($result === FALSE) {
			$conn->close();
			error('SQL Error: ' . $conn->error, 500);
		}
		
		$leaderboard = array();
		while ($row = $result->fetch_assoc()) {
			array_push($leaderboard, $row);
		}
		return $leaderboard;
	}
	
	function submitBestScore($conn, $name, $score) {
		$sql = 'INSERT INTO Leaderboard (name, score) VALUES (?, ?)';
		$stmt = $conn->prepare($sql);
		$stmt->bind_param('si', $name, $score);
		if (!$stmt->execute()) {
			$stmt->close();
			$conn->close();
			error('SQL Error: ' . $conn->error, 500);
		}
		$stmt->close();
	}
?>