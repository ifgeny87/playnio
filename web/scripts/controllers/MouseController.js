/**
 * Контроллер манипулятора типа мышь MouseController следит за нажатием кнопок в указанном теге.
 *
 * Контроллер ловит события перемещения, зажатие и отжатие обеих кнопок, скролла.
 */
const MouseController = {

	// состояние клавиш мыши
	buttons: {left: false, right: false, middle: false},

	// позиция курсора
	pos: {x: 0, y: 0, pageX: 0, pageY: 0, offsetX: 0, offsetY: 0},

	mouseIsOnBoard: false,     // мышь находится на поле

	// хендлеры событий
	onMouseEventCb: null,
	onMouseMoveCb: null,
	onMouseWheelCb: null,

	/**
	 * Инициализация контроллера
	 * @param controlNode
	 * @param onMouseEventCb
	 * @param onMouseMoveCb
	 * @param onMouseWheelCb
	 */
	init(controlNode, onMouseEventCb, onMouseMoveCb, onMouseWheelCb) {
		this.onMouseEventCb = onMouseEventCb
		this.onMouseMoveCb = onMouseMoveCb
		this.onMouseWheelCb = onMouseWheelCb

		// запрещаю правое меню
		controlNode.oncontextmenu = () => false

		// все события однотипны, поэтому биндю их на один метод
		controlNode.onmousedown = this.onMouseEvent.bind(this)
		controlNode.onmouseup = this.onMouseEvent.bind(this)
		controlNode.onmouseover = this.onMouseEvent.bind(this)
		controlNode.onmouseout = this.onMouseEvent.bind(this)

		// move выполняется чаще, поэтому его не нужно так часто вызывать
		controlNode.onmousemove = this.onMouseMove.bind(this)

		// в разных браузерах - разные события колеса
		controlNode.wheel = this.onMouseWheel.bind(this)
		controlNode.onwheel = this.onMouseWheel.bind(this)
		controlNode.onmousewheel = this.onMouseWheel.bind(this)
	},

	/**
	 * Обработчик события мыши: зажатие кнопки, отжатие кнопки, появляение над или уход с объекта наблюдения
	 * @param e
	 */
	onMouseEvent(e) {
		this.buttons.left = !!(e.buttons & 1)
		this.buttons.right = !!(e.buttons & 2)
		this.buttons.middle = !!(e.buttons & 4)
		let type = e.type

		if (type === 'mouseover')
			this.mouseIsOnBoard = true

		if (type === 'mouseout')
			this.mouseIsOnBoard = false

		// вызываем callback
		this.onMouseEventCb && this.onMouseEventCb(type, this.buttons)
	},

	/**
	 * Обработчик события перемещения по объекту наблюдения
	 * @param x
	 * @param y
	 * @param pageX
	 * @param pageY
	 * @param offsetX
	 * @param offsetY
	 */
	onMouseMove({x, y, pageX, pageY, offsetX, offsetY}) {
		this.pos = {x, y, pageX, pageY, offsetX, offsetY}
		// вызываем callback
		this.onMouseMoveCb && this.onMouseMoveCb(this.pos)
	},

	/**
	 * Обработчик события колеса над объектом налюдения
	 * @param e
	 * @returns {boolean}
	 */
	onMouseWheel(e) {
		let delta = e.deltaY
		this.onMouseWheelCb && this.onMouseWheelCb(delta)
		return false
	}
}