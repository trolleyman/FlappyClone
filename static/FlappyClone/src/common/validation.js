// NB: If these constants are updated, remember to update the Django versions (in api/validation.py)!
const USERNAME_MIN_LENGTH = 1;
const USERNAME_MAX_LENGTH = 16;
const USERNAME_REGEX = /^[a-zA-Z0-9-_]*$/g;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 24;
const EMAIL_MIN_LENGTH = 4;
const EMAIL_MAX_LENGTH = 24;

// NB: If updating these functions, ensure that the Django functions are also updated (in api/validation.py)!
function isValidName(name) {
	var valid = true;
	var reason = "";
	var help = "";
	if (typeof name !== "string") {
		valid = false;
		reason = "Please enter a username.";
	} else if (name === "") {
		valid = false;
		reason = "Please enter a username.";
	} else if (name.length < USERNAME_MIN_LENGTH) {
		valid = false;
		reason = "Username is too short.";
	} else if (name.length > USERNAME_MAX_LENGTH) {
		valid = false;
		reason = "Username is too long.";
	} else if ((name.match(USERNAME_REGEX) || []).length === 0) {
		valid = false;
		reason = "Invalid username.";
		help = "Username must contain only alphanumeric characters, dashes or underscores.";
	}
	return {valid: valid, reason: reason, help: help};
}

// NB: If updating these functions, ensure that the Django functions are also updated (in api/validation.py)!
function isValidPassword(password) {
	var valid = true;
	var reason = "";
	var help = "";
	if (typeof password !== "string") {
		valid = false;
		reason = "Please enter a password.";
	} else if (password === "") {
		valid = false;
		reason = "Please enter a password.";
	} else if (password.length < PASSWORD_MIN_LENGTH) {
		valid = false;
		reason = "Password is too short.";
	} else if (password.length > PASSWORD_MAX_LENGTH) {
		valid = false;
		reason = "Password is too long.";
	}
	return {valid: valid, reason: reason, help: help};
}

// NB: If updating these functions, ensure that the Django functions are also updated (in api/validation.py)!
function isValidEmail(email) {
	var valid = true;
	var reason = "";
	var help = "";
	if (typeof email !== "string") {
		valid = false;
		reason = "Please enter an email.";
	} else if (email === "") {
		valid = false;
		reason = "Please enter an email.";
	} else if (email.length < EMAIL_MIN_LENGTH) {
		valid = false;
		reason = "Email is too short.";
	} else if (email.length > EMAIL_MAX_LENGTH) {
		valid = false;
		reason = "Email is too long.";
	} else {
		var num = (email.match(/@/g) || []).length;
		if (num !== 1) {
			valid = false;
			reason = "Invalid email.";
		}
	}
	return {valid: valid, reason: reason, help: help};
}
