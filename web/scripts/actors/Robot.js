/**
 * Класс Робота.
 */
define(['actors/GameActor'], GameActor => class Robot extends GameActor {
	/**
	 * Роботы маленькие, поэтому будут рисоваться в масштабе .5
	 * @param x
	 * @param y
	 * @param z
	 */
	constructor(x = 0, y = 0, z = 0) {
		super('robot', x, y, z, 20, 20, .5, 100);

		this.spriteNormalY = this.sprite.y;

		this.jumpDelta = 0;
		this.jumpLength = 0;
	}

	/**
	 * В методе обновления будем робота учить прыгать при ходьбе.
	 * @param delta
	 */
	update(delta) {
		// если у робота задана скорость, то активируем его прыгучесть
		if (this.speedX || this.speedY) {
			if (this.jumpDelta === 0) {
				this.jumpDelta += delta;
				// вычисляем время, сколько робот будет находиться в полете
				this.jumpLength = .2 + Math.random() * .3;    // 1 sec
			}
		}

		if (this.jumpDelta > 0) {
			this.jumpDelta += delta;
			// пока робот движется, будем считать для него высоту прыжка по синусоиде
			this.sprite.y = this.spriteNormalY + Math.sin(Math.PI / this.jumpLength * this.jumpDelta) * 15;
			if(this.jumpDelta > this.jumpLength) {
				this.jumpDelta = 0;
			}
		}

		super.update(delta);
	}
});