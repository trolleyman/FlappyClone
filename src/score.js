
const BEST_SCORE_COOKIE_NAME = "BEST_SCORE";

const LEADERBOARD_API_PATH = "api/leaderboard.php";
const LEADERBOARD_URL = LEADERBOARD_API_PATH;
//const LEADERBOARD_URL = "http://trolleyman.org/FlappyClone/" + LEADERBOARD_API_PATH;
//const LEADERBOARD_URL = "http://localhost:80/" + LEADERBOARD_API_PATH;

// NB: If these constants are updated, remember to update the PHP AWS versions (in priv/name.php)!!
const MAX_NAME_LENGTH = 10;
const NUM_LEADERBOARD_ENTRIES = 10;

function setBestScore(score) {
	setCookie(BEST_SCORE_COOKIE_NAME, score, 365);
	console.log("Best score set: " + score);
}

function getBestScore() {
	var bestScore = parseInt(getCookie(BEST_SCORE_COOKIE_NAME));
	if (isNaN(bestScore)) {
		bestScore = 0;
		setBestScore(0);
	}
	return bestScore;
}

// NB: If updating these functions, ensure that the PHP AWS functions are also updated (in priv/name.php)!
function isLegalName(name) {
	if (typeof name !== "string") {
		return false;
	} else if (name === "") {
		return false;
	} else if (name.length > MAX_NAME_LENGTH) {
		return false;
	} else {
		for (var i = 0; i < name.length; i++)
			if (!isLegalNameChar(name[i]))
				return false;
	}
	return true;
}

// NB: If updating these functions, ensure that the PHP AWS functions are also updated (in priv/name.php)!
function isLegalNameChar(c) {
	if (c.charCodeAt(0) >= 'a'.charCodeAt(0) && c.charCodeAt(0) <= 'z'.charCodeAt(0)) {
		// lowercase chars
		return true;
	} else if (c.charCodeAt(0) >= 'A'.charCodeAt(0) && c.charCodeAt(0) <= 'Z'.charCodeAt(0)) {
		// uppercase chars
		return true;
	} else if (c.charCodeAt(0) >= '1'.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0)) {
		// digits
		return true;
	}
	return false;
}

// Takes a callback that is triggered when the leaderboard has been loaded.
function getLeaderboard(successCallback, errorCallback) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status === 200) {
				var text = this.responseText;
				var leaderboard = null;
				try {
					leaderboard = JSON.parse(text);
				} catch (e) {
					errorCallback("Invalid JSON response: " + text);
				}
				successCallback(leaderboard);
			} else {
				errorCallback(this.statusText + ": " + this.responseText);
			}
		}
	};
	req.open("GET", LEADERBOARD_URL, true);
	req.send();
}

// Takes a callback that is triggered when the score has been submitted.
function submitBestScore(name, score, successCallback, errorCallback) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status === 200) {
				successCallback();
			} else {
				var e = "" + this.status;
				if (this.statusText)
					e += " " + this.statusText;
				e += ": ";
				errorCallback(e + this.responseText);
			}
		}
	};
	var params = "name=" + encodeURIComponent(name) + "&score=" + encodeURIComponent(score);
	req.open("POST", LEADERBOARD_URL, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send(params);
}