/**
 * Игровой контроллер GameController выполняет логику приложения.
 *
 * Контроллер инициализирует и использует другие вспомогательные контроллеры.
 */
define(['controllers/KeyboardController',
		'controllers/GraphicsController',
		'controllers/NetController',
		'actors/AnimatedSprite',
		'actors/Robot',
		'actors/Player',
		'const/Keys'],
	(KeyboardController, GraphicsController, NetController, AnimatedSprite, Robot, Player, Keys) => class {

		constructor() {
			// инит клавиатурного контроллера
			KeyboardController.init(this.onKeyDown.bind(this), this.onKeyUp.bind(this));

			// инит графического контроллера
			GraphicsController.init(this.onUpdate.bind(this), this.onDraw.bind(this));

			// отключу сглаживание графики
			GraphicsController.setSmooth(false);

			// инит сетевого контроллера
			// NetController.init(this.onConnect.bind(this), this.onDisconnect.bind(this), this.onError.bind(this), this.onMessage.bind(this));

			// информация о сервере
			this.serverInfo = null;

			// камера
			this.camera = {x: 0, y: 0, zoom: 1.0, rotate: 0};

			// загрузка картинок
			// GraphicsController.loadImage('ball', 'images/ball.png');
			// GraphicsController.loadImage('mountain', 'images/mountain.png');
			GraphicsController.loadTileImage({
				key: 'char',
				src: 'images/motw.png',
				frameWidth: 52,
				frameHeight: 72,
				left: 1,
				top: 1,
				right: 1,
				bottom: 1
			});

			// подготовка спрайтов
			GraphicsController.initAnimatedSprite({
				key: 'robot',
				tileImage: 'char',
				animations: {
					'down': {frames: [7, 6, 7, 8], fps: 6},
					'left': {frames: [19, 18, 19, 20], fps: 6},
					'right': {frames: [31, 30, 31, 32], fps: 6},
					'up': {frames: [43, 42, 43, 44], fps: 6}
				}
			});

			GraphicsController.initAnimatedSprite({
				key: 'coren',
				tileImage: 'char',
				animations: {
					'down': {frames: [1, 0, 1, 2], fps: 6},
					'left': {frames: [13, 12, 13, 14], fps: 6},
					'right': {frames: [25, 24, 25, 26], fps: 6},
					'up': {frames: [37, 36, 37, 38], fps: 6}
				}
			});

			// Робот
			this.robots = [];
			for (let i = 0; i < 6; i++)
				for (let j = 0; j < 4; j++)
					this.robots.push(new Robot(50 + i * 100, 50 + j * 100));

			// Один из игроков
			this.players = [new Player(300, 200)];
		}

		/**
		 * Зажата кнопка
		 * @param keyCode
		 */
		onKeyDown(keyCode) {
			let f = function() {
				if (KeyboardController.keyPressed[Keys.LEFT]) {
					Object.assign(this, {speedX: -1, speedY: 0});
					this.sprite.setAnimationKey('left');
				}
				else if (KeyboardController.keyPressed[Keys.RIGHT]) {
					Object.assign(this, {speedX: 1, speedY: 0});
					this.sprite.setAnimationKey('right');
				}
				else if (KeyboardController.keyPressed[Keys.UP]) {
					Object.assign(this, {speedX: 0, speedY: -1});
					this.sprite.setAnimationKey('up');
				}
				else if (KeyboardController.keyPressed[Keys.DOWN]) {
					Object.assign(this, {speedX: 0, speedY: 1});
					this.sprite.setAnimationKey('down');
				}
				else {
					Object.assign(this, {speedX: 0, speedY: 0});
				}

				if(this.speedX || this.speedY)
					this.sprite.play();
				else
					this.sprite.stop();
			};

			this.robots.forEach(r => f.call(r));
			this.players.forEach(p => f.call(p));

			// функциаональная клавиша F9 меняет режим отображения графики
			if(KeyboardController.keyPressed[Keys.F9]) {
				GraphicsController.renderStyle++;
				if(GraphicsController.renderStyle > 7)
					GraphicsController.renderStyle = 1;
				console.log('Graphics render style=', GraphicsController.renderStyle);
				KeyboardController.keyPressed[Keys.F9] = false;
			}
		}

		/**
		 * Отжата кнопка
		 * @param keyCode
		 */
		onKeyUp(keyCode) {
			this.onKeyDown(keyCode)
		}

		/**
		 * Обновление комнаты
		 * @param delta
		 * @param length
		 */
		onUpdate(delta) {
			for(let i in this.robots)
				this.robots[i].update(delta);

			for(let i in this.players)
				this.players[i].update(delta);

			let fps = 'fps: ' + GraphicsController.stats.fps.toFixed(2);
			let frames = ('frames: ' + GraphicsController.stats.frameTimes).pad(' ', 15);
			let length = ('time: ' + GraphicsController.time.length.toFixed(1)).pad(' ', 15);
			statusLine.innerText = `${fps}, ${frames}, ${length} s`;
		}

		onDraw(ctx) {
			let canvasWidth = GraphicsController.canvas.width,
				canvasHeight = GraphicsController.canvas.height;
			// очистка фона
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			// вместо очистки экрана рисуем фоновую картинку
			// GraphicsController.drawImage('mountain');

			for(let i in this.robots)
				this.robots[i].draw();

			for(let i in this.players)
				this.players[i].draw();
		}

		/**
		 * Соединение с сервером создано
		 * @param e
		 */
		onConnect(e) {
			GraphicsController.graph.canvas.style = 'background: silver';
		}

		/**
		 * Соединение с сервером разорвано
		 * @param e
		 */
		onDisconnect(e) {
			GraphicsController.graph.canvas.style = 'background: maroon';
			this.player = null;
			this.players = {};
			this.rainBalls = {};
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
			let serverInfo = json.server;
			if (serverInfo)
				this.serverInfo = serverInfo;

			// когда сервер подтвердил игрока, то он сообщает ему об этом с помощью ключа "you"
			if (json.you) {
				this.player = new Player();
				this.player.updateFromJson(json.you);
				this.players[json.you.id] = this.player;
			}

			// если есть инофрмация о мире, подгрузим
			if (json.world)
				for (let i = 0; i < json.world.length; i++) {
					let info = json.world[i];

					if (info.type === 'Player') {
						if (!this.players[info.id]) {
							this.players[info.id] = new Player();
						}
						this.players[info.id].updateFromJson(info);
					}

					if (info.type === 'RainBall') {
						if (!this.rainBalls[info.id]) {
							this.rainBalls[info.id] = new RainBall();
						}
						this.rainBalls[info.id].updateFromJson(info);
					}
				}
		}
	});
