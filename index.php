<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Flappy Clone</title>
		
		<link rel="stylesheet" href="css/game.css">
		
		<!-- Icon stuff. Generated using http://realfavicongenerator.net -->
		<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
		<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
		<link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
		<link rel="manifest" href="/manifest.json">
		<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
		<meta name="theme-color" content="#ffffff">
	</head>
	<body>
		<script>"use strict";</script>
<?php if (!in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1'))) { ?>
		<script src="js/game.js"></script>
<?php } else { ?>
		<script src="src/fontfaceonload.js"></script>
		<script src="src/intersection.js"></script>
		<script src="src/cookie.js"></script>
		<script src="src/score.js"></script>
		<script src="src/button.js"></script>
		<script src="src/rect.js"></script>
		<script src="src/draw.js"></script>
		<script src="src/pipe.js"></script>
		<script src="src/bird.js"></script>
		<script src="src/game.js"></script>
<?php } ?>
		
		<div id="game-container">
			<div id="stats-container" style="visibility: hidden;"><div id="stats"></div></div>
			<canvas id="canvas" width="500" height="800"></canvas>
		</div>
	</body>
</html>