(function() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	ctx.circle = function(x, y, radius) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
	};
	
	canvas.width = 1000;
	canvas.height = 600;
	
	var radius = 40;
	var gravity = 0.5;
	var jumpPower = 15;
	var shape = "circle";
	
	var scroll = {
		total: 0,
		dist: 200,
		speed: 10
	};
	
	var ball = {
		x: canvas.width / 2,
		y: canvas.height / 2,
		dy: 0,
		plat: null,
		speed: 10
	};
	
	var platforms = [
		{
			x: -10000,
			y: canvas.height,
			width: 20000,
			height: 0
		}, {
			x: 100,
			y: 450,
			width: 200,
			height: 10
		}, {
			x: 500,
			y: 350,
			width: 200,
			height: 10
		}
	];
	
	var keys = {};
	window.onkeydown = function(event) {
		var key = (event || window.event).keyCode;
		keys[key] = true;
		if(key == 79) shape = "circle"; // O
		if(key == 80) shape = "square"; // P
	};
	window.onkeyup = function(event) {
		var key = (event || window.event).keyCode;
		keys[key] = false;
	};
	
	function physics() {
		if(keys[37]) ball.x -= ball.speed;
		if(keys[39]) ball.x += ball.speed;
		if(ball.x < radius + scroll.total) {
			ball.x = radius + scroll.total;
			ball.dx = 0;
		}
		if(ball.x > canvas.width - radius + scroll.total) {
			ball.x = canvas.width - radius + scroll.total;
			ball.dx = 0;
		}
		if(ball.plat && (ball.x + radius <= ball.plat.x || ball.x - radius >= ball.plat.x + ball.plat.width)) ball.plat = null;
		if(!ball.plat) {
			var lastY = ball.y;
			ball.dy -= gravity;
			ball.y -= ball.dy;
			for(var i = 0; !ball.plat && i < platforms.length; i++) {
				var plat = platforms[i];
				if(ball.x + radius > plat.x && ball.x - radius < plat.x + plat.width && lastY + radius < plat.y && ball.y + radius >= plat.y) {
					ball.y = plat.y - radius;
					ball.dy = 0;
					ball.plat = plat;
				}
			}
		}
		else if(keys[38]) {
			ball.plat = null;
			ball.dy = jumpPower;
			ball.y -= ball.dy;
		}
		if(ball.x > canvas.width - scroll.dist + scroll.total) scroll.total += scroll.speed;
		if(ball.x < scroll.dist + scroll.total) scroll.total -= scroll.speed;
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "black";
		for(var i = 0; i < platforms.length; i++) {
			var plat = platforms[i];
			ctx.fillRect(plat.x - scroll.total, plat.y, plat.width, plat.height);
		}
		ctx.fillStyle = "green";
		if(shape == "circle") ctx.circle(ball.x - scroll.total, ball.y, radius);
		else if(shape == "square") ctx.fillRect(ball.x - radius - scroll.total, ball.y - radius, radius * 2, radius * 2);
	}
	
	setInterval(function() {
		physics();
		draw();
	}, 10);
})();