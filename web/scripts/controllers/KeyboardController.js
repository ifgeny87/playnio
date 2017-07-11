1/**
 * Контроллер манипулятора типа клавиатура KeyboardController следит за нажатием кнопок в окне браузера.
 *
 * Контроллер ловит только кнопки из списка availKeys, все остальные кнопки пропускает.
 *
 * Браузер даже при событии зажатия кнопки периодически будет вызывать метод document.onkeydown пока кнопка не будет
 * отжата. Контроллер KeyboardController нужен для фильтрации событий. Игровой контроллер будет оповещен только об
 * одном зажатии и отжатии одной кнопки.
 */

define(['const/Keys'], Keys => KeyboardController = {

	init(onKeyDownCb = null, onKeyUpCb = null, availKeys = null) {
		// список разрешенных кнопок
		this.availKeys = [];

		// список зажатых кнопок
		this.keyPressed = {};

		// хендлеры на зажатие и отжатие кнопки
		this.onKeyDownCb = onKeyDownCb;
		this.onKeyUpCb = onKeyUpCb;

		// подпишемся на события клавиатуры документа
		document.onkeydown = this.onKeyDown.bind(this);
		document.onkeyup = this.onKeyUp.bind(this);

		// кнопки, которые будут обработаны
		this.availKeys = availKeys ||
			// список кнопок по умолчанию
			[Keys.ENTER, Keys.ESCAPE, Keys.SPACE, Keys.LEFT, Keys.UP, Keys.RIGHT, Keys.DOWN, Keys.F9];
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
		if (!this.keyPressed[keyCode]) {
			this.keyPressed[keyCode] = true;
			this.onKeyDownCb && this.onKeyDownCb(keyCode)
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
		if (this.keyPressed[keyCode]) {
			delete this.keyPressed[keyCode];
			this.onKeyUpCb && this.onKeyUpCb(keyCode)
		}

		return false
	}
});