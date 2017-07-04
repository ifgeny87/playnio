/**
 * Контроллер манипулятора типа клавиатура KeyboardController следит за нажатием кнопок в окне браузера.
 *
 * Контроллер ловит только кнопки из списка availKeys, все остальные кнопки пропускает.
 *
 * Браузер даже при событии зажатия кнопки периодически будет вызывать метод document.onkeydown пока кнопка не будет
 * отжата. Контроллер KeyboardController нужен для фильтрации событий. Игровой контроллер будет оповещен только об
 * одном зажатии и отжатии одной кнопки.
 */
const KeyboardController = {

	// кода кнопок
	KEY_ENTER: 13,
	KEY_ESCAPE: 27,
	KEY_SPACE: 32,
	KEY_LEFT: 37,
	KEY_UP: 38,
	KEY_RIGHT: 39,
	KEY_DOWN: 40,

	// список разрешенных кнопок
	availKeys: [],

	// список зажатых кнопок
	keyPressed: {},

	// хендлеры на зажатие и отжатие кнопки
	onKeyDownCb: null,
	onKeyUpCb: null,

	/**
	 * Инициализация
	 * @param onKeyDownCb - хендлер на нажатую кнопку
	 * @param onKeyUpCb - хендлер на отжатую кнопку
	 */
	init(onKeyDownCb, onKeyUpCb) {
		this.onKeyDownCb = onKeyDownCb;
		this.onKeyUpCb = onKeyUpCb;
		document.onkeydown = this.onKeyDown.bind(this);
		document.onkeyup = this.onKeyUp.bind(this);

		// доступные кнопки
		this.availKeys = [this.KEY_ENTER, this.KEY_ESCAPE, this.KEY_SPACE,
			this.KEY_LEFT, this.KEY_UP, this.KEY_RIGHT, this.KEY_DOWN];
	},

	/**
	 * Обработчик зажатия кнопки
	 * @param e
	 * @returns {boolean}
	 */
	onKeyDown(e) {
		let keyCode = e.keyCode;

		// проверка доступных клавиш
		if (this.availKeys.indexOf(keyCode) === -1)
			return true;

		// проверка уже нажатых
		if(!this.keyPressed[keyCode]) {
			this.keyPressed[keyCode] = true;
			this.onKeyDownCb(keyCode)
		}

		return false
	},

	/**
	 * Обработчик отжатия кнопки
	 * @param e
	 * @returns {boolean}
	 */
	onKeyUp(e) {
		let keyCode = e.keyCode;

		// проверка доступных клавиш
		if (this.availKeys.indexOf(keyCode) === null)
			return true;

		// проверка уже нажатых
		if(this.keyPressed[keyCode]) {
			delete this.keyPressed[keyCode];
			this.onKeyUpCb(keyCode)
		}

		return false
	}
};