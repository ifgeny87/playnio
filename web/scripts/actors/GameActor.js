/**
 * Класс Игрового актера комнаты.
 *
 * Любой актер в команте - это динамический объект. Он может менять позицию, скорость или размер.
 *
 * Актер имеет свои координаты в комнате.
 * Координаты спрайта актера - это центр для отрисовки спрайта.
 */
define(['actors/AnimatedSprite'], AnimatedSprite => class GameActor {
	constructor(animationKey, x = 0, y = 0, z = 0, width = 100, height = 100, scale = 1, moveSpeed = 100) {
		this.sprite = new AnimatedSprite(animationKey, 24, 64, z, width, height, scale, scale, 0);
		this.x = x;
		this.y = y;
		this.speedX = 0;
		this.speedY = 0;
		this.moveSpeed = moveSpeed;
	}

	/**
	 * Установка слоя для отображения актера
	 * @param z
	 */
	setZ(z) {
		this.sprite.z = z;
	}

	update(delta) {
		this.sprite.update(delta);
		this.x += this.speedX * delta * this.moveSpeed;
		this.y += this.speedY * delta * this.moveSpeed;
		this.setZ(Math.floor(this.y));
	}

	draw() {
		this.sprite.draw(this.x, this.y);
	}
});