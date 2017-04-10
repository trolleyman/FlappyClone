function updateSizing() {
	$('#title > span').bigText();
}

$(function(){
	$(window).resize(updateSizing);
	updateSizing();
})

$(window).on("load", updateSizing)
