define(['controllers/NetController',
		'controllers/KeyboardController',
		'actors/AnimatedSprite',
		'actors/Player',
		'actors/Robot',
		'const/Keys'],
	(NetController, KeyboardController, AnimatedSprite, Player, Robot, Keys) => class ArenaRoom {

		constructor(gameController) {
			this.gameController = gameController

			this.pause = true

			this.actors = new Map()

			this.player = null

			this.availKeys = [Keys.LEFT, Keys.UP, Keys.RIGHT, Keys.DOWN]
		}

		start() {
			this.pause = false
		}

		onKeyDown(keyCode) {
			if (NetController.webSocket.readyState !== WebSocket.OPEN)
				return true

			if (this.availKeys.indexOf(keyCode) === null)
				return true

			this.sendPlayerActionToServer()
			return false
		}

		onKeyUp(keyCode) {
			if (NetController.webSocket.readyState !== WebSocket.OPEN)
				return true

			if (this.availKeys.indexOf(keyCode) === null)
				return true

			this.sendPlayerActionToServer()
			return false
		}

		static sendPlayerActionToServer() {
			let left = !!KeyboardController.keyPressed[Keys.LEFT]
			let up = !!KeyboardController.keyPressed[Keys.UP]
			let right = !!KeyboardController.keyPressed[Keys.RIGHT]
			let down = !!KeyboardController.keyPressed[Keys.DOWN]

			// если направление null, значит ни одна кнопка не нажата
			let direction = null

			if (left) {
				direction = up ? 45 : down ? -45 : 0
			}
			else if (right) {
				direction = up ? 135 : down ? -135 : 180
			}
			else if (up) {
				direction = 90
			}
			else if (down) {
				direction = -90
			}

			if (direction === null)
				NetController.sendMessage({player: {action: 'stop'}})
			else
				NetController.sendMessage({player: {action: 'mode', direction}})
		}

		onUpdate(delta) {
			if (this.pause) return

			this.actors.forEach(a => a.update(delta))
		}

		onDraw(ctx, canvasWidth, canvasHeight) {
			this.actors.forEach(a => a.draw(a.x, a.y))
		}

		onConnect() {
			this.pause = false
		}

		onDisconnect() {
			this.pause = true
		}

		onMessage(json) {
			if (json.you) {
				// если игрок еще не создан, создаем
				if (!this.player) {
					this.player = new Player(json.you.x, json.you.y)
					this.actors.set(json.you.id, this.player)
				}
				// обновление
				this.player.updateFromJson(json)
			}

			if (json.world) {
				json.world.forEach(actorJson => {
					if (!this.actors.has(actorJson.id)) {
						if (actorJson.type === 'Player') {
							this.actors.set(actorJson.id, new Player(actorJson.id))
						}
						else if (actorJson.type === 'Robot') {
							this.actors.set(actorJson.id, new Robot(actorJson.id))
						}
						else {
							console.error('[Unknown Actor Type] Сервер прислал информацию об актере неизвестного типа ' + actorJson.type)
						}
					}
					// обновление
					this.actors.get(actorJson.id).updateFromJson(actorJson)
				})
			}
		}
	})
