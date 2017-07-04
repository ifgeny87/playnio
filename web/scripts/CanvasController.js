/**
 * Графический контроллер CanvasController следит за перерисовкой страницы.
 *
 * Будет оповещать игровой контроллер о том, когда браузер соберется выполнять перерисовку окна. Это очень удобно,
 * потому что в этом случае браузер будет экономить ресурсы на отрисовку.
 */
const CanvasController = {

	drawRequestId: null,    // номер подписки на эвент

	// информация о времени
	time: {
		start: performance.now(),   // время начала, мс
		last: null,         // предыдущая точка, мс
		now: null,          // текущее время обработки, мс
		length: .0,         // сколько всего прошло от начала, мс
		delta: .0           // дельта времени (now-last), мс
	},

	// статистика
	stats: {
		fps: .0,            // расчетная велинича fps
		delta10: .0         // fps будет считаться мягко - за 10 ходов
	},

	// ссылки на объекты
	graph: {
		canvas: null,       // ссылка на канвас
		ctx: null           // ссылка на графический контекст
	},

	// хендлер для отрисовки
	onUpdateCb: null,

	/**
	 * Инициализация контроллера
	 */
	init: function (onUpdateCb) {
		this.onUpdateCb = onUpdateCb;

		// запоминаю канву и контекст
		this.graph.canvas = document.getElementById('canvas');
		this.graph.ctx = this.graph.canvas.getContext('2d');

		// подпишусь на событие перерисовки браузера
		this.drawRequestId = requestAnimationFrame(() => this.nextstep());
	},

	/**
	 * Выполняется обновление комнаты и перерисовка объектов
	 */
	nextstep: function () {
		// пересчет времени
		this.time.last = this.time.now;
		this.time.now = performance.now();
		this.time.length = this.time.now - this.time.start;
		this.time.delta = this.time.now - this.time.last;

		const delta = this.time.delta;   // мс

		// обновление
		this.onUpdateCb(this.graph.ctx, delta);

		// подпишусь на событие перерисовки браузера
		this.drawRequestId = requestAnimationFrame(() => this.nextstep());
	}
};