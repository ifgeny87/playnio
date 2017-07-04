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

	// дождевые мячи
	rainBalls: {},

	/**
	 * Инициализация
	 */
	init() {
		// инит контроллера мыши
		MouseController.init(document.getElementById('canvas'), this.onMouseEvent.bind(this));
		// инит графического контроллера
		GraphicsController.init(this.onUpdate.bind(this));
		// инит сетевого контроллера
		NetController.init(this.onConnect.bind(this), this.onDisconnect.bind(this), this.onError.bind(this), this.onMessage.bind(this));

		// загрузка картинок
		GraphicsController.loadImage('ball', 'images/ball.png');
		GraphicsController.loadImage('mountain', 'images/mountain.png');
	},

	/**
	 * Случилось событие мыши
	 * @param eventType
	 * @param buttons
	 */
	onMouseEvent(eventType, buttons) {
		if(eventType === 'mousedown' && buttons.left) {
			NetController.sendMessage({player: {action: 'click', x: MouseController.pos.offsetX, y: MouseController.pos.offsetY}});
		}
	},

	/**
	 * Отрисовка комнаты
	 * @param ctx
	 * @param delta
	 */
	onUpdate(ctx, delta) {
		let canvasWidth = GraphicsController.graph.canvas.width;
		let canvasHeight = GraphicsController.graph.canvas.height;

		// очистка фона
		// ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		// вместо очистки экрана рисуем фоновую картинку
		ctx.drawImage(GraphicsController.images['mountain'], 0, 0);

		if(NetController.webSocket.readyState !== WebSocket.OPEN) {
			ctx.font = '30px Arial';
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText('Сервер не отвечает', canvasWidth / 2, canvasHeight / 2 - 30);
			ctx.fillText('Снова попробуйте позже', canvasWidth / 2, canvasHeight / 2 + 30);
		}

		// нумеруем каждого игрока
		let index = 0;

		for(let i in this.players) {
			let player = this.players[i];
			index++;

			ctx.font = '20px Arial';
			ctx.fillStyle = player.color;
			ctx.textAlign = 'left';
			ctx.shadowBlur = 4;
			ctx.shadowColor = 'black';
			ctx.fillText(`Игрок ${index}: ${player.score}`, 20, index * 40);
		}

		// отключаем тень
		ctx.shadowBlur = 0;

		// рисуем дождевые мячи
		for(let i in this.rainBalls) {
			this.rainBalls[i].draw(ctx, delta);
		}
	},

	/**
	 * Соединение с сервером создано
	 * @param e
	 */
	onConnect(e) {
		GraphicsController.graph.canvas.style = 'background: silver';
	},

	/**
	 * Соединение с сервером разорвано
	 * @param e
	 */
	onDisconnect(e) {
		GraphicsController.graph.canvas.style = 'background: maroon';
		this.player = null;
		this.players = {};
		this.rainBalls = {};
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

		// когда сервер подтвердил игрока, то он сообщает ему об этом с помощью ключа "you"
		if (json.you) {
			this.player = new Player();
			this.player.updateFromJson(json.you);
			this.players[json.you.id] = this.player;
		}

		// если есть инофрмация о мире, подгрузим
		if(json.world)
			for(let i = 0; i < json.world.length; i++) {
				let info = json.world[i];

				if(info.type === 'Player') {
					if(!this.players[info.id]) {
						this.players[info.id] = new Player();
					}
					this.players[info.id].updateFromJson(info);
				}

				if(info.type === 'RainBall') {
					if(!this.rainBalls[info.id]) {
						this.rainBalls[info.id] = new RainBall();
					}
					this.rainBalls[info.id].updateFromJson(info);
				}
			}
	}
};
