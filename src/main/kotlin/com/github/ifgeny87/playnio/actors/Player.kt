package com.github.ifgeny87.playnio.actors

import com.beust.klaxon.*
import java.util.*

/**
 * Created in project canvas-draw-balls on 03.07.17
 */
class Player(val id: String) {
	var x: Double = Math.random() * 500.0 + 50
	var y: Double = Math.random() * 300.0 + 50
	var direction: Int = 0
	var moveSpeed: Double = .0
	val hexColor = "#" +
			(Random().nextInt(70) + 120).toString(16) +
			(Random().nextInt(70) + 120).toString(16) +
			(Random().nextInt(70) + 120).toString(16)

	val ang = Math.PI / 180.0

	/**
	 * Обновиление игрока на сервере
	 */
	fun update(delta: Double) {
		if (moveSpeed != .0) {
			val dx = Math.cos(ang * direction) * moveSpeed * delta
			val dy = Math.sin(ang * direction) * moveSpeed * delta
			x -= dx
			y -= dy
		}
	}

	/**
	 * Обновление состояния игрока от клиента
	 */
	fun updateFromClient(playerInfo: JsonObject) {
		val action = playerInfo.string("action")

		if (action == "move") {
			updateMove(playerInfo.obj("keys")!!)
		}
	}

	/**
	 * Изменяю скорость игрока в зависимости от нажатых им кнопок
	 */
	fun updateMove(keys: JsonObject) {
		val left = keys.boolean("37") == true
		val up = keys.boolean("38") == true
		val right = keys.boolean("39") == true
		val down = keys.boolean("40") == true

		this.direction = when (true) {
			left && up -> 45
			left && down -> -45
			right && up -> 135
			right && down -> -135
			right -> 180
			up -> 90
			down -> -90
			else -> 0
		}

		this.moveSpeed = if (left || up || right || down) .05 else .0
	}

	/**
	 * Возвращает json статус игрока
	 */
	fun toJsonObject(): JsonObject {
		val clzName = this.javaClass.simpleName
		return json {
			obj("type" to clzName,
					"id" to id,
					"x" to x,
					"y" to y,
					"direction" to direction,
					"moveSpeed" to moveSpeed,
					"color" to hexColor
			)
		}
	}
}