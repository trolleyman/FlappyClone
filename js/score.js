
const BEST_SCORE_COOKIE_NAME = "bestScore";
const MAX_NAME_LENGTH = 10;

const LEADERBOARD_COOKIE_NAME = "leaderboard";
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

function setLeaderboard(leaderboard) {
	setCookie(LEADERBOARD_COOKIE_NAME, JSON.stringify(leaderboard), 365);
}

// TODO: Error callback
// Takes a callback that is triggered when the leaderboard has been loaded.
function getLeaderboard(callback) {
	// for now, fake it.
	const DEFAULT_LEADERBOARD = [
// 		{name:"hello", score:31},
// 		{name:"my", score:20},
// 		{name:"baby", score:12},
// 		{name:"hello", score:9},
// 		{name:"my", score:8},
// 		{name:"darlin", score:5},
// 		{name:"hello", score:4},
// 		{name:"my", score:3},
// 		{name:"ragtime", score:2},
// 		{name:"gal", score:1},
	];
	
	var leaderboardStr = getCookie(LEADERBOARD_COOKIE_NAME);
	var leaderboard = null;
	if (leaderboardStr === "") {
		leaderboard = DEFAULT_LEADERBOARD;
		setLeaderboard(leaderboard);
	} else {
		leaderboard = JSON.parse(leaderboardStr);
	}
	
	setTimeout(callback, 2000, leaderboard);
}

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

// Takes a callback that is triggered when the score has been submitted.
function submitBestScore(name, score, successCallback, errorCallback) {
	getLeaderboard(function(leaderboard) {
		var pos = -1;
		for (var i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
			var e = leaderboard[i];
			if (typeof e === "undefined" || score > e.score) {
				pos = i;
				break;
			}
		}
		if (pos === -1) {
			setTimeout(errorCallback, 3000, "not good enough");
		} else {
			leaderboard.splice(pos, 0, {name:name, score:score});
			if (leaderboard.length > NUM_LEADERBOARD_ENTRIES) {
				leaderboard = leaderboard.slice(0, NUM_LEADERBOARD_ENTRIES);
			}

			setLeaderboard(leaderboard);
			setTimeout(successCallback, 2000);
			console.log("Submitted best score: " + name + ": " + score);
		}
	});
}
