(function() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	ctx.fillCircle = function(x, y, radius) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
	};
	
	canvas.width = 1000;
	canvas.height = 600;
	
	var LEFT = 0;
	var RIGHT = 1;
	
	function dist(a, b) {
		var dx = a.x - b.x;
		var dy = a.y - b.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	function playerBase() {
		return {
			dy: 0,
			plat: null,
			speed: 10,
			radius: 40,
			gravity: 0.5,
			jumpPower: 15,
			lives: 10
		};
	}
	
	function combine() {
		var obj = {};
		for(var i = 0; i < arguments.length; i++) {
			for(var key in arguments[i]) {
				obj[key] = arguments[i][key];
			}
		}
		return obj;
	}
		
	var players = [
		combine(playerBase(), {
			x: canvas.width - 200,
			y: canvas.height / 2,
			keys: {
				left: 37,
				right: 39,
				up: 38,
				shoot: 13 // enter
			},
			color: "green",
			facing: LEFT
		}), combine(playerBase(), {
			x: 200,
			y: canvas.height / 2,
			keys: {
				left: "A".charCodeAt(0),
				right: "D".charCodeAt(0),
				up: "W".charCodeAt(0),
				shoot: 32 // space
			},
			color: "blue",
			facing: RIGHT
		})
	];
	
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
			x: 400,
			y: 320,
			width: 200,
			height: 10
		}, {
			x: 700,
			y: 450,
			width: 200,
			height: 10
		}
	];
	
	var bullets = [];
	
	var keys = {};
	window.onkeydown = function(event) {
		var key = (event || window.event).keyCode;
		keys[key] = true;
		for(var i = 0; i < players.length; i++) {
			var player = players[i];
			if(key == player.keys.left) player.facing = LEFT;
			else if(key == player.keys.right) player.facing = RIGHT;
		}
	};
	window.onkeyup = function(event) {
		var key = (event || window.event).keyCode;
		keys[key] = false;
		for(var i = 0; i < players.length; i++) {
			var player = players[i];
			if(key == player.keys.shoot) {
				bullets.push({
					x: player.x,
					y: player.y,
					facing: player.facing,
					shooter: player,
					radius: 10,
					color: player.color,
					speed: 20
				});
			}
		}
	};
	
	function physics() {
		for(var i = 0; i < players.length; i++) {
			var player = players[i];
			if(keys[player.keys.left]) player.x -= player.speed;
			if(keys[player.keys.right]) player.x += player.speed;
			if(player.x < player.radius) {
				player.x = player.radius;
			}
			if(player.x > canvas.width - player.radius) {
				player.x = canvas.width - player.radius;
			}
			if(player.plat && (player.x + player.radius <= player.plat.x || player.x - player.radius >= player.plat.x + player.plat.width)) player.plat = null;
			if(!player.plat) {
				var lastY = player.y;
				player.dy -= player.gravity;
				player.y -= player.dy;
				for(var j = 0; !player.plat && j < platforms.length; j++) {
					var plat = platforms[j];
					if(player.x + player.radius > plat.x && player.x - player.radius < plat.x + plat.width && lastY + player.radius < plat.y && player.y + player.radius >= plat.y) {
						player.y = plat.y - player.radius;
						player.dy = 0;
						player.plat = plat;
					}
				}
			}
			else if(keys[player.keys.up]) {
				player.plat = null;
				player.dy = player.jumpPower;
				player.y -= player.dy;
			}
		}
		for(var i = 0; i < bullets.length; i++) {
			var bullet = bullets[i];
			if(bullet.facing == LEFT) bullet.x -= bullet.speed;
			else bullet.x += bullet.speed;
			if(bullet.x < -bullet.radius || bullet.x > canvas.width + bullet.radius) bullets.splice(i--, 1);
			else for(var j = 0; j < players.length; j++) {
				var player = players[j];
				if(player != bullet.shooter && dist(player, bullet) < player.radius + bullet.radius) {
					bullets.splice(i--, 1);
					player.lives--;
					break;
				}
			}
		}
		for(var i = 0; i < players.length; i++) {
			if(players[i].lives == 0) clearInterval(interval);
		}
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "black";
		for(var i = 0; i < platforms.length; i++) {
			var plat = platforms[i];
			ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
		}
		for(var i = 0; i < players.length; i++) {
			var player = players[i];
			ctx.fillStyle = player.color;
			ctx.fillCircle(player.x, player.y, player.radius);
			ctx.fillStyle = "black";
			ctx.fillCircle(player.x + (player.facing == LEFT ? -1 : 1) * player.radius / 2, player.y - player.radius / 3, player.radius / 6);
			ctx.fillCircle(player.x + (player.facing == LEFT ? -1 : 1) * player.radius / 2, player.y + player.radius / 3, player.radius / 6);
		}
		for(var i = 0; i < bullets.length; i++) {
			var bullet = bullets[i];
			ctx.fillStyle = bullet.color;
			ctx.fillCircle(bullet.x, bullet.y, bullet.radius);
		}
		ctx.font = "30px Arial";
		ctx.fillStyle = "black";
		ctx.fillText(players[0].lives.toString(), canvas.width - 40, 30);
		ctx.fillText(players[1].lives.toString(), 10, 30);
	}
	
	var interval = setInterval(function() {
		physics();
		draw();
	}, 10);
})();