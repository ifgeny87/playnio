/**
 * Игровой контроллер GameController выполняет логику приложения.
 *
 * Контроллер инициализирует и использует другие вспомогательные контроллеры.
 */
define(['controllers/KeyboardController',
		'controllers/GraphicsController',
		'controllers/NetController',
		'rooms/ArenaRoom',
		'const/Keys'],
	(KeyboardController, GraphicsController, NetController, ArenaRoom, Keys) => class GameController {

		constructor() {
			// инит клавиатурного контроллера
			KeyboardController.init(this.onKeyDown.bind(this), this.onKeyUp.bind(this))

			// инит графического контроллера
			GraphicsController.init(this.onUpdate.bind(this), this.onDraw.bind(this), this.onPostDraw.bind(this))

			// отключу сглаживание графики
			GraphicsController.setSmooth(false)

			// инит сетевого контроллера
			NetController.init(this.onConnect.bind(this), this.onDisconnect.bind(this), this.onError.bind(this), this.onMessage.bind(this))

			// информация о сервере
			this.serverInfo = null

			//
			// загрузка картинок
			//

			GraphicsController.loadTileImage({
				key: 'char',
				src: 'images/motw.png',
				frameWidth: 52,
				frameHeight: 72,
				left: 1,
				top: 1,
				right: 1,
				bottom: 1
			})

			//
			// подготовка спрайтов
			//

			GraphicsController.initAnimatedSprite({
				key: 'robot',
				tileImage: 'char',
				animations: {
					'down': {frames: [7, 6, 7, 8], fps: 6},
					'left': {frames: [19, 18, 19, 20], fps: 6},
					'right': {frames: [31, 30, 31, 32], fps: 6},
					'up': {frames: [43, 42, 43, 44], fps: 6}
				}
			})

			GraphicsController.initAnimatedSprite({
				key: 'coren',
				tileImage: 'char',
				animations: {
					'down': {frames: [1, 0, 1, 2], fps: 6},
					'left': {frames: [13, 12, 13, 14], fps: 6},
					'right': {frames: [25, 24, 25, 26], fps: 6},
					'up': {frames: [37, 36, 37, 38], fps: 6}
				}
			})

			// генерация комнаты
			this.room = new ArenaRoom(this)

			// старт комнаты
			this.room.start()
		}

		/**
		 * Зажата кнопка
		 * @param keyCode
		 */
		onKeyDown(keyCode) {
			// функциаональная клавиша F9 меняет режим отображения графики
			if (Keys.F9 === keyCode) {
				GraphicsController.renderStyle++
				if (GraphicsController.renderStyle > 7)
					GraphicsController.renderStyle = 1
				console.log('Graphics render style change to =', GraphicsController.renderStyle)
				// отменяю нажатую кнопку для кнотроллера
				KeyboardController.keyPressed[Keys.F9] = false
				return false
			}

			return this.room.onKeyDown(keyCode)
		}

		/**
		 * Отжата кнопка
		 * @param keyCode
		 */
		onKeyUp(keyCode) {
			return this.room.onKeyUp(keyCode)
		}

		/**
		 * Обновление комнаты
		 * @param delta
		 */
		onUpdate(delta) {
			// обновление комнаты
			this.room.onUpdate(delta)

			// обновление статуса
			let fps = 'fps: ' + GraphicsController.stats.fps.toFixed(2)
			let frames = ('frames: ' + GraphicsController.stats.frameTimes).pad(' ', 15)
			let length = ('time: ' + GraphicsController.time.length.toFixed(1)).pad(' ', 15)
			statusLine.innerText = `${fps}, ${frames}, ${length} s`
		}

		/**
		 * Основная отрисовка игры
		 * @param ctx
		 * @param width
		 * @param height
		 */
		onDraw(ctx, width, height) {
			// очистка фона
			ctx.clearRect(0, 0, width, height)

			// отрисовка комнаты
			this.room.onDraw(ctx, width, height)
		}

		/**
		 * Пост-отрисовка
		 * Используется для вывода сервисных сообщений
		 * @param ctx
		 * @param width
		 * @param height
		 */
		onPostDraw(ctx, width, height) {
			if (NetController.webSocket.readyState !== WebSocket.OPEN) {
				// сохранение настроек контекста
				ctx.save()
				{
					ctx.fillStyle = 'rgba(255, 0, 0, .6)'
					ctx.rect(0, 0, width, height)
					ctx.fill()

					ctx.font = 'bold 15px monospace, sans-serif'
					ctx.fillStyle = 'white'
					ctx.fillText('Server conection lost...', 10, 30)
				}
				// восстановление настроек контекста
				ctx.restore()
			}
		}

		/**
		 * Соединение с сервером создано
		 * @param e
		 */
		onConnect(e) {
			this.room.onConnect()
		}

		/**
		 * Соединение с сервером разорвано
		 * @param e
		 */
		onDisconnect(e) {
			this.room.onDisconnect()
		}

		/**
		 * Ошибка в соединении
		 * @param e
		 */
		onError(e) {
		}

		/**
		 * Пришло новое сообщение от сервера
		 * @param json
		 */
		onMessage(json) {
			if (json.serverInfo)
				this.serverInfo = json.serverInfo

			this.room.onMessage(json)
		}
	})
