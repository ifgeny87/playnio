/**
 * Игровой контроллер GameController выполняет логику приложения.
 *
 * Контроллер инициализирует и использует другие вспомогательные контроллеры.
 */
const GameController = {

	// информация о сервере
	serverInfo: null,

	// игрок этого клиента
	player: null,

	// все игроки поля
	players: {},

	/**
	 * Инициализация
	 */
	init() {
		// инит клавиатурного контроллера
		KeyboardController.init(this.onKeyDown.bind(this), this.onKeyUp.bind(this));
		// инит графического контроллера
		CanvasController.init(this.onUpdate.bind(this));
		// инит сетевого контроллера
		NetController.init(this.onConnect.bind(this), this.onDisconnect.bind(this), this.onError.bind(this), this.onMessage.bind(this));
	},

	/**
	 * Зажата кнопка
	 * @param keyCode
	 */
	onKeyDown(keyCode) {
		switch (keyCode) {
			case KeyboardController.KEY_LEFT:
			case KeyboardController.KEY_RIGHT:
			case KeyboardController.KEY_UP:
			case KeyboardController.KEY_DOWN:
				return NetController.sendMessage({player: {action: 'move', keys: KeyboardController.keyPressed}});
		}
	},

	/**
	 * Отжата кнопка
	 * @param keyCode
	 */
	onKeyUp(keyCode) {
		switch (keyCode) {
			case KeyboardController.KEY_LEFT:
			case KeyboardController.KEY_RIGHT:
			case KeyboardController.KEY_UP:
			case KeyboardController.KEY_DOWN:
				return NetController.sendMessage({player: {action: 'move', keys: KeyboardController.keyPressed}});
		}
	},

	/**
	 * Отрисовка комнаты
	 * @param ctx
	 * @param delta
	 */
	onUpdate(ctx, delta) {
		let canvasWidth = CanvasController.graph.canvas.width;
		let canvasHeight = CanvasController.graph.canvas.height;

		// очистка фона
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		if(NetController.webSocket.readyState !== WebSocket.OPEN) {
			ctx.font = '30px Arial';
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText('Сервер не отвечает', canvasWidth / 2, canvasHeight / 2 - 30);
			ctx.fillText('Снова попробуйте позже', canvasWidth / 2, canvasHeight / 2 + 30);
		}

		for(let i in this.players) {
			this.players[i].draw(ctx, delta);
		}
	},

	/**
	 * Соединение с сервером создано
	 * @param e
	 */
	onConnect(e) {
		CanvasController.graph.canvas.style = 'background: silver';
	},

	/**
	 * Соединение с сервером разорвано
	 * @param e
	 */
	onDisconnect(e) {
		CanvasController.graph.canvas.style = 'background: maroon';
		this.player = null;
		this.players = {};
	},

	/**
	 * Ошибка в соединении
	 * @param e
	 */
	onError(e) {

	},

	/**
	 * Пришло новое сообщение от сервера
	 * @param json
	 */
	onMessage(json) {
		let serverInfo = json.server;
		if(serverInfo)
			this.serverInfo = serverInfo;

		if (json.you) {
			this.player = new Player(json.you.id);
			this.player.updateFromJson(json.you);
			this.players[json.you.id] = this.player;
		}

		if(json.world)
			for(let i = 0; i < json.world.length; i++) {
				let info = json.world[i];
				if(info.type === 'Player') {
					if(!this.players[info.id]) {
						this.players[info.id] = new Player(info.id);
					}
					this.players[info.id].updateFromJson(info);
				}
			}
	}
};
