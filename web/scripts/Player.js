/**
 * Класс игрока
 */
function Player(id) {
	this.id = id;
	this.x = 300;
	this.y = 200;
	this.width2 = 15;
	this.height2 = 15;
	this.direction = 0;
	this.moveSpeed = 0;
	this.color = '';

	this.ang = Math.PI / 180.0;

	this.updateFromJson = function(json) {
		console.log('MOOOOVE', this.x, json.x)
		this.x = json.x;
		this.y = json.y;
		this.direction = json.direction;
		this.moveSpeed = json.moveSpeed;
		this.color = json.color;
	};

	this.draw = function (ctx, delta) {
		if(this.moveSpeed) {
			let dx = Math.cos(this.ang * this.direction) * this.moveSpeed;
			let dy = Math.sin(this.ang * this.direction) * this.moveSpeed;
			this.x -= dx * delta;
			this.y -= dy * delta;
		}

		ctx.beginPath();
		ctx.rect(this.x - this.width2, this.y - this.height2, this.width2 * 2, this.height2 * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.strokeStyle = '#00ffff';
		ctx.lineWidth = 2;
		ctx.stroke();
	};
}
