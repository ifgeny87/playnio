package com.github.ifgeny87.playnio.controllers

import com.beust.klaxon.*
import com.github.ifgeny87.common.distance
import com.github.ifgeny87.playnio.actors.RainBall
import com.github.ifgeny87.playnio.sockets.ClientGameSocket
import java.util.concurrent.CopyOnWriteArraySet

class GameController : Runnable {

	// список клиентов
	val webSockets = CopyOnWriteArraySet<ClientGameSocket>()

	// время старта сервера
	val serverStartTime = System.nanoTime() / 1_000_000.0

	// время сервера
	var serverLastTime = serverStartTime

	// время прошло со старта
	var serverTimeLength = 0.0

	// падающие мячи
	val balls = ArrayList<RainBall>()

	init {
		for (i in 0..9)
			balls.add(RainBall())
	}

	/**
	 * Новый клиент подключился
	 */
	fun onClientConnect(client: ClientGameSocket) {
		webSockets.add(client)

		// акцептую клиента, сообщу ему его id и всю нужную информацию
		client.sendMessage(json {
			obj(
					"server" to statusToJsonObject(),
					"you" to client.player.toJsonObject()
			)
		})

		// отправляю всем клиентам обновленное состояние мира
		sendWorldToAllClients(worldToJsonArray())
	}

	/**
	 * Клиент отключился
	 */
	fun onClientDisconnect(client: ClientGameSocket) {
		webSockets.remove(client)
	}

	/**
	 * Клиент прислал сообщение
	 */
	fun onClientMessage(client: ClientGameSocket, jsonObject: JsonObject) {
		// проверяю, что пришло
		val playerInfo = jsonObject.obj("player")

		playerInfo?.let {
			if (playerInfo.string("action") == "click") {
				// от клиента пришла информация о щелчке мыши
				// определяем координаты мыши на поле
				val px = playerInfo.int("x")!! * 1.0
				val py = playerInfo.int("y")!! * 1.0

				// поиск мяча под прицелом
				val ballUnderAttack = balls.firstOrNull { distance(it.x, it.y, px, py) < 20 }

				// если нашелся хоть один мяч, то надо обработать выстрел
				ballUnderAttack?.let {
					// игрок заработал еще одно очко
					client.player.score++

					// обновляем мяч
					ballUnderAttack.reset()

					// повышаю скорость падения мяча
					ballUnderAttack.moveSpeed *= 1.5

					// отправляем обновленный мир
					sendWorldToAllClients(JsonArray<Any>(
							ballUnderAttack.toJsonObject(),
							client.player.toJsonObject()
					))
				}
			}
		}
	}

	/**
	 * Генерирует статус сервера для передачи клиенту
	 */
	fun statusToJsonObject(): JsonObject {
		return json {
			obj("time" to serverTimeLength)
		}
	}

	/**
	 * Генерирует json состояние всех объектов мира
	 */
	fun worldToJsonArray(): JsonArray<Any> {
		val world = JsonArray<Any>()
		webSockets.forEach { world.add(it.player.toJsonObject()) }
		balls.forEach { world.add(it.toJsonObject()) }
		return world
	}

	/**
	 * Рассылка сообщения всем игрокам
	 */
	fun sendWorldToAllClients(jsonObj: JsonObject) {
		val message = json {
			obj(
					"server" to statusToJsonObject(),
					"world" to array(jsonObj)
			)
		}
		webSockets.forEach { it.sendMessage(message) }
	}

	/**
	 * Рассылка сообщения всем игрокам
	 */
	fun sendWorldToAllClients(jsonArr: JsonArray<Any>) {
		val message = json {
			obj(
					"server" to statusToJsonObject(),
					"world" to jsonArr)
		}
		webSockets.forEach { it.sendMessage(message) }
	}

	/**
	 * Сам процесс игры
	 */
	override fun run() {
		val me = Thread.currentThread()

		while (!me.isInterrupted) {
			// расчет времени
			val now = System.nanoTime() / 1_000_000.0
			val delta = (now - serverLastTime)
			serverLastTime = now
			serverTimeLength = now - serverStartTime

			// для каждого клиента пересчитываю координаты
			webSockets.forEach { it.player.update(delta) }

			val updateBalls = ArrayList<RainBall>()

			// также пересчитываю мячи
			balls.forEach {
				it.update(delta)
				if (it.y > 420) {
					it.reset()
					updateBalls.add(it)
				}
			}

			if (updateBalls.size > 0)
				sendWorldToAllClients(
						JsonArray<Any>(updateBalls.map { it.toJsonObject() }))

			// надо поспать чтобы не вешать сервер
			Thread.sleep(10)
		}
	}
}