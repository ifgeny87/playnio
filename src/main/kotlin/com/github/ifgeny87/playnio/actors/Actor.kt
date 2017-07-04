package com.github.ifgeny87.playnio.actors

import com.beust.klaxon.JsonObject
import com.beust.klaxon.json
import java.util.*

const val ANG = Math.PI / 180.0

/**
 * Актер - базовый объект мира
 */
abstract class Actor {

	val id = UUID.randomUUID().toString()

	var x: Double = .0

	var y: Double = .0

	var direction: Double = .0

	var moveSpeed: Double = .0

	/**
	 * Обновление актера на сервере
	 */
	open fun update(delta: Double) {
		if (moveSpeed != .0) {
			val dx = Math.cos(ANG * direction) * moveSpeed * delta
			val dy = Math.sin(ANG * direction) * moveSpeed * delta
			x -= dx
			y -= dy
		}
	}

	/**
	 * Возвращает json статус актера
	 */
	open fun toJsonObject(): JsonObject {
		val clzName = this.javaClass.simpleName
		return json {
			obj("type" to clzName,
					"id" to id,
					"x" to x,
					"y" to y,
					"direction" to direction,
					"moveSpeed" to moveSpeed
			)
		}
	}
}