/**
 * Сетевой контроллер NetController предоставляет интерфейс для общения с сервером.
 *
 * Контроллер будет оповещать игровой контроллер о всех событиях сети, а также предоставляет метод для отправки
 * сообщения серверу.
 */
define(() => NetController = {

	// объект сокета
	webSocket: null,

	// хендлеры сокета
	onConnectCb: null,
	onDisconnectCb: null,
	onErrorCb: null,
	onMessageCb: null,

	/**
	 * Инициализация контроллера
	 */
	init: function (onConnectCb, onDisconnectCb, onErrorCb, onMessageCb) {
		this.onConnectCb = onConnectCb
		this.onDisconnectCb = onDisconnectCb
		this.onErrorCb = onErrorCb
		this.onMessageCb = onMessageCb

		this.createConnection()
	},

	/**
	 * Создание соединения
	 */
	createConnection: function () {
		let ws = new WebSocket('ws://localhost:3333')

		ws.onopen = e => {
			console.info('[Connection Opened]', arguments)

			// счетчик неудачных подключений сбрасывается
			this.closeConnectionCount = 0

			this.onConnectCb && this.onConnectCb(e)
		}

		ws.onclose = e => {
			console.warn('[Connection Closed]', arguments)

			// увеличиваем счетчик неудачных подключений
			this.closeConnectionCount++

			this.onDisconnectCb && this.onDisconnectCb(e)
		}

		ws.onerror = e => {
			console.error('[Connection Error]', arguments)

			this.onErrorCb(e)
		}

		ws.onmessage = message => {
			console.trace('[Received Message]', message.data)
			this.onMessageCb && this.onMessageCb(JSON.parse(message.data))
		}

		this.webSocket = ws
	},

	/**
	 * Отправка сообщения Json
	 * @param obj
	 */
	sendMessage(obj) {
		this.webSocket.send(JSON.stringify(obj))
	}
})