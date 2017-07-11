/**
 * Класс Спрайт.
 *
 * Спрайт - это стандартный графический объект в комнате. Спрайт имеет координаты, размер, масштаб и поворот.
 * Класс спрайта стоит обозначить как абстрактный, потому что экземпляр спрайта не является самостоятельным.
 * Набор свойств спрайта является стандартным и часто используемым.
 *
 * По сути, любой класс, наследуемый от спрайта - это некий физический объект в комнате. Наследник может иметь свое
 * поведение при обновлении и отрисовке.
 */
define(() => class Sprite {
	constructor(x = 0, y = 0, z = 0, width = 100, height = 100, scaleX = 1, scaleY = 1, rotate = 0) {
		this.x = x; // позиция по X
		this.y = y; // позиция по Y
		this.z = z; // позици по Z (чем больше, тем ближе к зрителю, тот же z-index в html)
		this.width = width;     // ширина
		this.height = height;   // высота
		this.scaleX = scaleX;   // масштаб по X
		this.scaleY = scaleY;   // масштаб по Y
		this.rotate = rotate;   // поворот

		// обновление границ объекта
		this.updateBounds();
	}

	/**
	 * Вычисление размеров спрайта
	 */
	updateBounds() {
		let left = -this.width / 2,
			top = -this.height / 2;
		this.bounds = {
			left,
			top,
			width: this.width,
			height: this.height,
			right: left + this.width,
			bottom: top + this.height
		}
	}

	/*
	 просто объявлю тут методы, которые должны быть в потомках
	 */

	update(delta) {
	}

	draw(x, y) {
	}
});