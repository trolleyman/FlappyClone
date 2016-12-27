
const BEST_SCORE_COOKIE_NAME = "bestScore";
const MAX_NAME_LENGTH = 10;

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

// TODO: Error callback
// Takes a callback that is triggered when the leaderboard has been loaded.
function getLeaderboard(callback) {
	// for now, fake it.
	var leaderboard = [
		{name:"hello", score:132},
		{name:"my", score:31},
		{name:"baby", score:30},
		{name:"hello", score:27},
		{name:"my", score:24},
		//{name:"darlin", score:23},
		//{name:"hello", score:22},
		//{name:"my", score:22},
		//{name:"ragtime", score:10},
		//{name:"gal", score:3},
	];
	setTimeout(callback, 2000, leaderboard);
}

function isValidName(name) {
	if (typeof name !== "string") {
		return false;
	} else if (name === "") {
		return false;
	} else if (name.length > MAX_NAME_LENGTH) {
		return false;
	}
	return true;
}

// Takes a callback that is triggered when the score has been submitted.
function submitBestScore(name, score, successCallback, errorCallback) {
	setTimeout(successCallback, 2000, true);
	console.log("submitted best score: " + score);
}
