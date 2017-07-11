/**
 * Графический контроллер GraphicsController следит за перерисовкой страницы.
 *
 * Будет оповещать игровой контроллер о том, когда браузер соберется выполнять перерисовку окна. Это очень удобно,
 * потому что в этом случае браузер будет экономить ресурсы на отрисовку.
 */
define(() => GraphicsController = {

	init(onUpdateCb = null, onDrawCb = null) {
		// хендлеры
		this.onUpdateCb = onUpdateCb;
		this.onDrawCb = onDrawCb;

		// информация о времени
		this.time = {
			start: performance.now() / 1000,   // время начала, с
			last: null,         // предыдущая точка, с
			now: null,          // текущее время обработки, с
			length: .0,         // сколько всего прошло от начала, с
			delta: .0           // дельта времени (now-last), с
		};

		// статистика
		this.stats = {
			fps: .0,            // расчетная велинича fps
			delta10: .0,        // fps будет считаться мягко - за последние 10 кадров
			frameTimes: 0       // колво отрисованных кадров
		};

		// хранилище картинок
		this.images = {};

		// хранилище тайлов
		this.tileImages = {};

		// стиль рендера
		// определяется как набор бит
		this.renderStyle = 1;

		// возможные стили рендера
		this.DRAW_IMAGE_STYLE =         0b000001;
		this.SPRITE_POSITION_STYLE =    0b000010;
		this.DRAW_FRAME_STYLE =         0b000100;

		// хранилище анимированных спрайтов
		this.animatedSprites = {};

		// запоминаю канву и контекст
		this.canvas = document.getElementById('canvas');    // канва
		this.ctx = this.canvas.getContext('2d');    // ссылка на графический контекст

		// подпишусь на событие перерисовки браузера
		this.drawRequestId = requestAnimationFrame(() => this.tick());

		// бинд методов
		this.setSmooth.bind(this);
		this.tick.bind(this);
	},

	/**
	 * Управление сглаживанием графики
	 * @param flag
	 */
	setSmooth(flag) {
		this.ctx.imageSmoothingEnabled = flag;
		this.ctx.mozImageSmoothingEnabled = flag;
		this.ctx.webkitImageSmoothingEnabled = flag;
		this.ctx.msImageSmoothingEnabled = flag;
	},

	/**
	 * Выполняется обновление комнаты и перерисовка объектов
	 */
	tick() {
		// пересчет времени
		this.time.last = this.time.now;
		this.time.now = performance.now() / 1000;
		this.time.length = this.time.now - this.time.start;
		this.time.delta = this.time.now - this.time.last;

		// fps считаем мягко
		this.stats.delta10 = this.stats.delta10 * .9 + this.time.delta;
		this.stats.fps = 10 / this.stats.delta10;
		++this.stats.frameTimes;

		// обновление
		this.onUpdateCb(this.time.delta);

		// очистка слоев
		this.graphicLayers = {};

		// перерисовка
		this.onDrawCb(this.ctx);

		// отрисовка по слоям
		this.drawLayers();

		// подпишусь на событие перерисовки браузера
		this.drawRequestId = requestAnimationFrame(() => this.tick());
	},

	/**
	 * Загрузка картинок
	 * @param key - номер картинки, ее ключ в общей куче
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

	loadTileImage(options) {
		const o = Object.assign({frameWidth: 100, frameHeight: 100, left: 0, top: 0, right: 0, bottom: 0}, options);

		if (!o.src || !o.key) return console.error('Property key or src is not set.');
		if (!o.frameWidth || o.frameWidth <= 0) return console.error('Property frameWidth is not set');
		if (!o.frameHeight || o.framHeight <= 0) return console.error('Property frameHeight is not set');

		const image = this.loadImage(o.key, o.src);

		const tileFrame = {
			image,
			frames: [],
			frameWidth: o.frameWidth - o.left - o.right,
			frameHeight: o.frameHeight - o.top - o.bottom
		};

		image.onload = () => {
			// когда картинка загрузится
			// считаю для каждого кадра его размеры
			const countX = Math.trunc(image.width / o.frameWidth);
			const countY = Math.trunc(image.height / o.frameHeight);
			let frames = [];
			for (let j = 0; j < countY; j++)
				for (let i = 0; i < countX; i++)
					frames.push({x: i * o.frameWidth + o.left, y: j * o.frameHeight + o.top});
			Object.assign(tileFrame, {frames});
		};

		this.tileImages[o.key] = tileFrame;
	},

	/**
	 * Отрисовка картинки
	 * @param key - номер картинки
	 * @param x
	 * @param y
	 * @param width - по умолчанию равен ширине картинки
	 * @param height
	 */
	drawImage(key, x, y, width, height) {
		const image = this.images[key];

		if (!x) x = 0;
		if (!y) y = 0;

		if (!width) {
			width = image.width;
			height = image.height;
		}
		if (!height) {
			height = width;
		}

		this.ctx.drawImage(image.image, 0, 0, image.width, image.height, x, y, width, height);
	},

	addToLayer(layer, cb) {
		if (!this.graphicLayers[layer])
			this.graphicLayers[layer] = [];
		this.graphicLayers[layer].push(cb);
	},

	drawLayers() {
		let keys = Object.keys(this.graphicLayers).sort((a, b) => a > b);
		for(let i in keys)
			for(let key in this.graphicLayers[keys[i]]) {
				let cb = this.graphicLayers[keys[i]][key];
				cb(this.ctx);
			}
	},

	/**
	 * Отрисовка картинки в позиции 0:0
	 * @param key
	 * @param width
	 * @param height
	 */
	drawImageCenter(key, width, height) {
		const image = this.images[key];

		if (!width) {
			width = image.width;
			height = image.height;
		}
		if (!height) {
			height = width;
		}

		this.ctx.drawImage(image.image, 0, 0, image.width, image.height, -width / 2, -height / 2, width, height);
	},

	drawTileImage(key, index, x, y, width, height) {
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
	},

	initAnimatedSprite(options) {
		this.animatedSprites[options.key] = options;
	},
});