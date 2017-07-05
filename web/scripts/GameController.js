/**
 * Игровой контроллер GameController выполняет логику приложения.
 *
 * Контроллер инициализирует и использует другие вспомогательные контроллеры.
 */
const GameController = {

	camera: {x: 50, y: 70, zoom: 1.0},  // камера

	lastMousePos: {},   // чтобы выполнять перетаскивание, нужно запоминать предыдущее положение мыши

	/**
	 * Инициализация
	 */
	init() {
		// инит контроллера мыши
		MouseController.init(document.getElementById('canvas'), null, this.onMouseMove.bind(this), this.onMouseWheel.bind(this));
		// инит графического контроллера
		GraphicsController.init(this.onUpdate.bind(this));
		// отключу сглаживание графики
		GraphicsController.setSmooth(false);
		// инит контроллера картинок
		ImageController.init(GraphicsController.graph.ctx);

		// загрузка картинок
		ImageController.loadTileImage({
			key: 'char',
			src: 'images/motw.png',
			tileWidth: 52,
			tileHeight: 72,
			left: 1,
			top: 1,
			right: 1,
			bottom: 1
		});
	},

	/**
	 * Обработка перемещения мыши по канвасу
	 * @param mousePos
	 */
	onMouseMove(mousePos) {
		if (MouseController.buttons.left) {
			// зажата левая кнопка, будем смещать камеру
			this.camera.x += mousePos.offsetX - this.lastMousePos.offsetX;
			this.camera.y += mousePos.offsetY - this.lastMousePos.offsetY;
		}
		// будем запоминать последнюю точку, где была мышь
		this.lastMousePos = mousePos;
	},

	/**
	 * С помощью колеса будем менять зум камеры
	 * @param delta
	 */
	onMouseWheel(delta) {
		if (delta < 0) {
			this.camera.zoom *= 1.1;
		}
		else if (delta > 0) {
			this.camera.zoom /= 1.1;
		}
	},

	/**
	 * Отрисовка комнаты
	 * @param ctx
	 * @param delta
	 */
	onUpdate(ctx, delta, length) {
		// очистка фона
		ctx.clearRect(0, 0, GraphicsController.graph.canvas.width, GraphicsController.graph.canvas.height);

		ctx.save();
		ctx.translate(this.camera.x, this.camera.y);
		ctx.scale(this.camera.zoom, this.camera.zoom);

		for (let i = 0; i < 12; i++)
			for (let j = 0; j < 8; j++) {
				let index = i + j * 12;
				ctx.save();
				ctx.translate(i * 60, j * 70);
				ImageController.drawTileImage('char', index, -25, -65);
				ctx.fillStyle = 'blue';
				ctx.fillText(index, 15, 10);
				ctx.restore();
			}

		ctx.restore();
	}
};
