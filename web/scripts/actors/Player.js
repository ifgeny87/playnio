/**
 * Класс Игрока.
 */
define(['actors/GameActor'], GameActor => class Player extends GameActor {
	constructor(id, x = 0, y = 0, z = 0) {
		super(id, 'coren', x, y, z, 40, 40, 1.7, 200)

		this.score = 0
	}

	/**
	 * Обновление данных от сервера.
	 * @param json
	 */
	updateFromJson(json) {
		this.score = json.score
		this.x = json.x
		this.y = json.y
		this.direction = json.direction
		this.moveSpeed = json.moveSpeed
	}
})