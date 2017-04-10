
function onInputUsername(input) {
	var ret = isValidName(input.value);
	setValid(input, ret.valid, ret.reason);
}

function onInputPassword(input) {
	var ret = isValidPassword(input.value);
	setValid(input, ret.valid, ret.reason);
}

function onInputEmail(input) {
	var ret = isValidEmail(input.value);
	setValid(input, ret.valid, ret.reason);
}

function onInputConfirm(name, input, confirm) {
	setValid(confirm, input.value === confirm.value, name + " don't match.");
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function setValid(input, valid, messages, helpMsg) {
	// Remove errors
	var errorlist = input.parentNode.nextElementSibling;
	if (typeof errorlist !== "undefined" && errorlist.tagName === 'UL' && errorlist.className === 'errorlist') {
		// Remove error list
		errorlist.parentNode.removeChild(errorlist);
	}
	// Remove help
	var help = input.parentNode.querySelector('.help-hidden, .help-visible');
	if (typeof help !== "undefined") {
		help.parentNode.removeChild(help);
	}
	
	// Setup class names
	if (valid) {
		input.className = "";
	} else {
		input.className = "invalid";
		if (typeof messages === "undefined")
			messages = [];
		if (typeof messages === "string")
			messages = [messages];
		
		if (messages.length > 0) {
			// Add error list
			errorlist = document.createElement('ul');
			errorlist.className = 'errorlist';
			for (var i = 0; i < messages.length; i++) {
				var err = document.createElement('li');
				err.innerText = messages[i];
				errorlist.appendChild(err);
			}
			insertAfter(errorlist, input.parentNode);
		}
		
		if (typeof helpMsg !== "undefined" && helpMsg !== "") {
			
		}
	}
}

function registerOnInput(selector, func) {
	var input = document.querySelector(selector);
	input.addEventListener('input', func.bind(null, input));
}

window.onload = function(){
	// Usernames
	registerOnInput('#login input[name=username]', onInputUsername);
	registerOnInput('#signup input[name=username]', onInputUsername);
	
	// Password
	registerOnInput('#login input[name=password]', onInputPassword);
	registerOnInput('#signup input[name=password]', onInputPassword);
	
	// Email
	registerOnInput('#signup input[name=email]', onInputEmail);
	
	// Confirm
	registerOnInput('#signup input[name=email_confirm]', onInputConfirm.bind(null, "Emails", document.querySelector('#signup input[name=email]')));
	registerOnInput('#signup input[name=email]', function() {
		onInputConfirm("Emails", document.querySelector('#signup input[name=email]'), document.querySelector('#signup input[name=email_confirm]'));
	})
	registerOnInput('#signup input[name=password_confirm]', onInputConfirm.bind(null, "Passwords", document.querySelector('#signup input[name=password]')));
	registerOnInput('#signup input[name=password]', function() {
		onInputConfirm("Passwords", document.querySelector('#signup input[name=password]'), document.querySelector('#signup input[name=password_confirm]'));
	})
};
