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
	var maxSpeed = 10;
	var accel = 1;
	var deaccel = 0.5;
	var jumpPower = 15;
	var shape = "circle";
	
	ball = {
		x: canvas.width / 2,
		y: canvas.height / 2,
		dx: 0,
		dy: 0,
		plat: null
	};
	
	var platforms = [
		{
			x: 0,
			y: canvas.height,
			width: canvas.width,
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
	
	function physics() {if(ball.plat)console.log(ball.plat);
		var lastDx = ball.dx;
		if(keys[37]) ball.dx -= accel;
		if(keys[39]) ball.dx += accel;
		if(ball.dx == lastDx) {
			if(ball.dx > 0) {
				ball.dx -= deaccel;
				if(ball.dx < 0) ball.dx = 0;
			}
			else if(ball.dx < 0) {
				ball.dx += deaccel;
				if(ball.dx > 0) ball.dx = 0;
			}
		}
		if(ball.dx > maxSpeed) ball.dx = maxSpeed;
		if(ball.dx < -maxSpeed) ball.dx = -maxSpeed;
		ball.x += ball.dx;
		if(ball.x < radius) {
			ball.x = radius;
			ball.dx = 0;
		}
		if(ball.x > canvas.width - radius) {
			ball.x = canvas.width - radius;
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
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "green";
		if(shape == "circle") ctx.circle(ball.x, ball.y, radius);
		else if(shape == "square") ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);
		ctx.fillStyle = "black";
		for(var i = 0; i < platforms.length; i++) {
			var plat = platforms[i];
			ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
		}
	}
	
	setInterval(function() {
		physics();
		draw();
	}, 10);
})();