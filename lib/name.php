<?php
	// NB: If these constants are updated, remember to update the JavaScript versions (in js/score.js)!!
	const NUM_LEADERBOARD_ENTRIES = 10;
	const MAX_NAME_LENGTH = 16;
	const LEGAL_SYMBOLS = '-_';
	
	// NB: If updating these functions, ensure that the JavaScript functions are also updated (in js/score.js)!
	function isLegalName($name, &$reason) {
		$reason = '';
		if (!is_string($name)) {
			$reason = 'name is not a string';
			return FALSE;
		} else if ($name === '') {
			$reason = 'name is an empty string';
			return FALSE;
		} else if (count($name) > MAX_NAME_LENGTH) {
			$reason = 'name is too long (' + strlen($name) + ' characters, max is ' + MAX_NAME_LENGTH;
			return FALSE;
		} else {
			$len = strlen($name);
			for ($i = 0; $i < $len; $i++) {
				$c = $name[$i];
				if (!isLegalNameChar($c)) {
					$reason = "name contains an illegal character ($c)";
					return FALSE;
				}
			}
		}
		return TRUE;
	}
	
	// NB: If updating these functions, ensure that the JavaScript functions are also updated (in js/score.js)!
	function isLegalNameChar($c) {
		if (ord($c) >= ord('a') && ord($c) <= ord('z')) {
			// lowercase chars
			return TRUE;
		} else if (ord($c) >= ord('A') && ord($c) <= ord('Z')) {
			// uppercase chars
			return TRUE;
		} else if (ord($c) >= ord('1') && ord($c) <= ord('9')) {
			// digits
			return TRUE;
		} else if (strpos(LEGAL_SYMBOLS, $c) !== FALSE) {
			return TRUE;
		}
		return FALSE;
	}
?>