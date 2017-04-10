function update() {
	$('#title > span').bigText({
		
	});
}

$(function(){
	$(window).resize(update);
	update();
})
