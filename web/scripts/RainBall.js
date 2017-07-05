/**
 * Класс дождевого мяча
 * Нужно было как-то назвать объект, который будет выглядеть как мяч и падать с неба
 */
function RainBall() {
	let x, y, direction, moveSpeed;

	// сервер ничего не будет знать о повороте мяча
	// это чисто визуальныйэффект
	let rotate = Math.random() * 360;
	let rotateSpeed = Math.random() * .01 - .005;

	// размер мяча (диаметр)
	const SIZE = 40.0;

	const ANG = Math.PI / 180.0;

	this.updateFromJson = function (json) {
		x = json.x;
		y = json.y;
		direction = json.direction;
		moveSpeed = json.moveSpeed;
		color = json.color;
	};

	this.draw = function (ctx, delta) {
		if (moveSpeed) {
			let dx = Math.cos(ANG * direction) * moveSpeed;
			let dy = Math.sin(ANG * direction) * moveSpeed;
			x -= dx * delta;
			y -= dy * delta;
		}

		// выполняем поворот
		rotate += rotateSpeed * delta;

		const ballImage = ImageController.images['ball'];
		const ballWidth = ballImage.width;
		const ballHeight = ballImage.height;
		const S2 = SIZE / 2;

		// запоминаем контекст, рисуем, восстанавливаем
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rotate);
		ImageController.drawImageCenter('ball', SIZE);
		ctx.restore();
	};
}
