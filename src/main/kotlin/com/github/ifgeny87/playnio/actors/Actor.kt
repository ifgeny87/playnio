package com.github.ifgeny87.playnio.actors

import com.beust.klaxon.JsonObject

const val ANG = Math.PI / 180.0

/**
 * Актер - простейший тип объекта мира
 */
abstract class Actor {

	var x: Double = .0
		get protected set;

	var y: Double = .0
		get protected set;

	var direction: Int = 0
		get protected set;

	var moveSpeed: Double = .0
		get protected set;

	/**
	 * Обновиление игрока на сервере
	 */
	fun update(delta: Double) {
		if (moveSpeed != .0) {
			val dx = Math.cos(ANG * direction) * moveSpeed * delta
			val dy = Math.sin(ANG * direction) * moveSpeed * delta
			x -= dx
			y -= dy
		}
	}

	/**
	 * Обновление состояния игрока от клиента
	 */
	abstract fun updateFromClient(playerInfo: JsonObject)
}