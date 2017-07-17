/**
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
		this.availKeys = []

		// список зажатых кнопок
		this.keyPressed = {}

		// хендлеры на зажатие и отжатие кнопки
		this.onKeyDownCb = onKeyDownCb
		this.onKeyUpCb = onKeyUpCb

		// подпишемся на события клавиатуры документа
		document.onkeydown = this.onKeyDown.bind(this)
		document.onkeyup = this.onKeyUp.bind(this)

		// кнопки, которые будут обработаны
		this.availKeys = availKeys ||
			// список кнопок, которые будут обработаны контроллером
			[
				Keys.ENTER, Keys.ESCAPE, Keys.SPACE,        // сревисные кнопки
				Keys.LEFT, Keys.UP, Keys.RIGHT, Keys.DOWN,  // стрелки
				Keys.F9                                     // функциональные кнопки
			]
	},

	/**
	 * Обработчик зажатия кнопки
	 * @param e
	 * @returns {boolean}
	 */
	onKeyDown(e) {
		let keyCode = e.keyCode

		// проверка доступных клавиш
		if (this.availKeys.indexOf(keyCode) === null)
		// кнопка не найдена среди доступных, кнопка не бужет обработана
			return true

		// проверка уже нажатых
		if (!this.keyPressed[keyCode]) {
			// запоминаем кнопку в списке нажатых кнопок
			this.keyPressed[keyCode] = true
			if (this.onKeyDownCb)
				return this.onKeyDownCb(keyCode)
		}

		// по умолчанию кнопка была обработана и не передается дальше
		return false
	},

	/**
	 * Обработчик отжатия кнопки
	 * @param e
	 * @returns {boolean}
	 */
	onKeyUp(e) {
		let keyCode = e.keyCode

		// проверка доступных клавиш
		if (this.availKeys.indexOf(keyCode) === null)
		// кнопка не найдена среди доступных, кнопка не бужет обработана
			return true

		// проверка уже нажатых
		if (this.keyPressed[keyCode]) {
			// удаляем кнопку из списка нажатых кнопок
			delete this.keyPressed[keyCode]
			if (this.onKeyUpCb)
				return this.onKeyUpCb(keyCode)
		}

		// по умолчанию кнопка была использована и не передается дальше
		return false
	}
})