package com.github.ifgeny87.playnio.actors

/**
 * Created in project playnio on 04.07.17
 */
class Robot : Actor() {

	init {
		reset()
		moveSpeed = Math.random() * .02 + .01
	}

	fun reset() {
		x = Math.random() * 640 - 20
		y = -20.0
		direction = -70 - Math.random() * 40
	}
}