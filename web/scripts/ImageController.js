/**
 * Контроллер картинок.
 * Выполняет роль загрузки и рисования картинок.
 * Добавлена функция загрузки картинки как набора тайлов.
 */
const ImageController = {

	ctx: null,              // ссылка на контекст

	images: {},             // картинки

	tileImages: {},         // набор тайлов для картинки

	/**
	 * Инициализация контроллера
	 * @param ctx
	 */
	init(ctx) {
		this.ctx = ctx;
	},

	/**
	 * Загрузка картинки
	 * @param key - номер картинки, ее ключ в общей куче картинок
	 * @param src - путь до картинки
	 */
	loadImage(key, src) {
		const image = new Image();
		image.src = src;

		this.images[key] = {
			image,
			width: null,    // пока картинка не загружена, определить размеры нельзя
			height: null
		};

		// ждем пока загрузится картинка и лишь тогда запоминаем размеры картинки
		image.onload = () => {
			Object.assign(this.images[key], {width: image.width, height: image.height});
		};

		return image;
	},

	/**
	 * Загрузка набора тайлов.
	 * Добавляет картинку в список. Когда картинка загрузится, выполняет расчет и запоминает набор фреймов.
	 * Тайл - это кадр на картинке. Тайл может быть с пустыми краями.
	 * Фрейм - это определенная область на картинке, которая будет рисоваться.
	 * @param options
	 */
	loadTileImage(options) {
		const o = Object.assign({tileWidth: 100, tileHeight: 100, left: 0, top: 0, right: 0, bottom: 0}, options);

		// проверка на ошибки
		if (!o.src || !o.key) return console.error('Property key or src is not set.');
		if (!o.tileWidth || o.tileWidth <= 0) return console.error('Property tileWidth is not set');
		if (!o.tileHeight || o.framHeight <= 0) return console.error('Property tileHeight is not set');

		// добавляем картинку в список картинок
		const image = this.loadImage(o.key, o.src);

		const tileFrame = {
			image,
			frames: [],     // набор фреймов картинки будет рассчитан после того когда мы узнаем размеры картинки
			frameWidth: o.tileWidth - o.left - o.right,      // ширина тайла, не фрейма!
			frameHeight: o.tileHeight - o.top - o.bottom     // высота тайла, не фрейма!
		};

		image.onload = () => {
			// когда картинка загрузится
			// считаем для каждого фрейма его размеры
			const countX = Math.trunc(image.width / o.tileWidth);
			const countY = Math.trunc(image.height / o.tileHeight);
			let frames = [];
			// заполняем описание фреймов
			for (let j = 0; j < countY; j++)
				for (let i = 0; i < countX; i++)
					frames.push({x: i * o.tileWidth + o.left, y: j * o.tileHeight + o.top});
			// запоминаем фреймы в наборе
			Object.assign(tileFrame, {frames});
		};

		this.tileImages[o.key] = tileFrame;
	},

	/**
	 * Отрисовка картинки.
	 * @param key - номер картинки.
	 * @param x
	 * @param y
	 * @param width - по умолчанию равна ширине картинки.
	 * @param height - по умолчанию равна высоте картинки. Если указана ширина, но не указана высота, то высота будет
	 * равна ширине. Это удобно для отрисовки квадратных картинок.
	 */
	drawImage(key, x = 0, y = 0, width = null, height = null) {
		const image = this.images[key];

		if (!x) x = 0;
		if (!y) y = 0;

		if (!width) {
			width = image.width;
			height = image.height;
		}
		else if (!height) {
			height = width;
		}

		this.ctx.drawImage(image.image, 0, 0, image.width, image.height, x, y, width, height);
	},

	/**
	 * Отрисовка картинки по центру картинки.
	 * @param key - номер картинки.
	 * @param width - по умолчанию равна ширине картинки.
	 * @param height - по умолчанию равна высоте картинки. Если указана ширина, но не указана высота, то высота будет
	 * равна ширине. Это удобно для отрисовки квадратных картинок.
	 */
	drawImageCenter(key, width = null, height = null) {
		const image = this.images[key];

		if (!width) {
			width = image.width;
			height = image.height;
		}
		else if (!height) {
			height = width;
		}

		this.ctx.drawImage(image.image, 0, 0, image.width, image.height, -width / 2, -height / 2, width, height);
	},

	/**
	 * Отрисовка одного кадра из набора тайлов.
	 * @param key - номер набора тайлов.
	 * @param index - номер фрейма.
	 * @param x
	 * @param y
	 * @param width - ширина, по умолчанию равна ширине фрейма.
	 * @param height - высота, по умолчанию равна высоте фрейма.
	 */
	drawTileImage(key, index, x = 0, y = 0, width = null, height = null) {
		const tileImage = this.tileImages[key];

		const frame = tileImage.frames[index];

		if (!frame) return;

		if (!x) x = 0;
		if (!y) y = 0;

		if (!width) width = tileImage.frameWidth;
		if (!height) height = tileImage.frameHeight;

		this.ctx.drawImage(this.images[key].image,
			frame.x, frame.y, tileImage.frameWidth, tileImage.frameHeight,
			x, y, width, height);
	}
};