package com.github.ifgeny87.playnio.actors

import com.beust.klaxon.JsonObject
import com.beust.klaxon.boolean
import com.beust.klaxon.obj
import com.beust.klaxon.string
import java.util.*

/**
 * Created in project canvas-draw-balls on 03.07.17
 */
class Player : Actor() {

	val color: String

	var score: Int = 0

	init {
		// рандомный цвет игрока
		val rand = Random()
		color = "#" +
				(rand.nextInt(70) + 180).toString(16) +
				(rand.nextInt(70) + 180).toString(16) +
				(rand.nextInt(70) + 180).toString(16)
	}

	/**
	 * Возвращает json статус игрока
	 */
	override fun toJsonObject(): JsonObject {
		val jsonObj = super.toJsonObject()
		jsonObj.set("color", color)
		jsonObj.set("score", score)
		return jsonObj
	}
}