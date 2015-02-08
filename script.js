(function() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	ctx.fillCircle = function(x, y, radius) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
	};
	
	canvas.width = 1000;
	canvas.height = 800;
	
	var LEFT = 0;
	var RIGHT = 1;
	
	function dist(a, b) {
		var dx = a.x - b.x;
		var dy = a.y - b.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	function getPlayer(player) {
		return combine({
			dy: 0,
			plat: null,
			speed: 5,
			radius: 30,
			gravity: 0.5,
			jumpPower: 15,
			lives: 20
		}, player);
	}
	
	function getPlatform(platform) {
		return combine({
			width: 200,
			height: 10
		}, platform);
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
	
	var players;
	var platforms;
	var bullets;
	var playing = false;
	
	function init() {
		players = [
			getPlayer({
				x: canvas.width - 200,
				y: canvas.height - 200,
				keys: {
					left: 37,
					right: 39,
					up: 38,
					shoot: 13 // enter
				},
				color: "green",
				facing: LEFT
			}), getPlayer({
				x: 200,
				y: canvas.height - 200,
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
		
		platforms = [
			getPlatform({
				x: 0,
				y: canvas.height,
				width: canvas.width,
				height: 0
			}), getPlatform({
				x: 100,
				y: 450
			}), getPlatform({
				x: 400,
				y: 320
			}), getPlatform({
				x: 700,
				y: 450
			}), getPlatform({
				x: 400,
				y: 600
			})
		];
		
		bullets = [];
		playing = true;
	}
	
	init();
	playing = false;
	
	var keys = {};
	window.onkeydown = function(event) {
		var key = (event || window.event).keyCode;
		keys[key] = true;
		if(playing) for(var i = 0; i < players.length; i++) {
			var player = players[i];
			if(key == player.keys.left) player.facing = LEFT;
			else if(key == player.keys.right) player.facing = RIGHT;
		}
	};
	window.onkeyup = function(event) {
		var key = (event || window.event).keyCode;
		keys[key] = false;
		if(playing) for(var i = 0; i < players.length; i++) {
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
	
	document.getElementById("start").onclick = function() {
		this.blur();
		this.disabled = true;
		if(!playing) setTimeout(init, 3000);
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
					player.lives--;
					if(player.lives > 0) bullets.splice(i--, 1);
					break;
				}
			}
		}
		for(var i = 0; i < players.length; i++) {
			if(players[i].lives == 0) {
				document.getElementById("start").disabled = false;
				playing = false;
			}
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
		ctx.textAlign = "right";
		ctx.fillStyle = players[0].color;
		ctx.fillText(players[0].lives.toString(), canvas.width - 10, 30);
		ctx.textAlign = "left";
		ctx.fillStyle = players[1].color;
		ctx.fillText(players[1].lives.toString(), 10, 30);
	}
	
	setInterval(function() {
		if(playing) physics();
		draw();
	}, 10);
})();