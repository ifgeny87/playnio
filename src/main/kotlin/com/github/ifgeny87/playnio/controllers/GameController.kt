package com.github.ifgeny87.playnio.controllers

import com.beust.klaxon.JsonArray
import com.beust.klaxon.JsonObject
import com.beust.klaxon.json
import com.beust.klaxon.obj
import com.github.ifgeny87.playnio.sockets.ClientGameSocket
import java.util.concurrent.CopyOnWriteArraySet

class GameController : Runnable {

	// список клиентов
	val webSockets = CopyOnWriteArraySet<ClientGameSocket>()

	// время старта сервера
	val serverStartTime = System.nanoTime()

	// время сервера
	var serverLastTime = System.nanoTime()

	// время прошло со старта
	var serverTimeLength = 0L

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
		if (playerInfo != null) {
			// обновлю данные игрока
			client.player.updateFromClient(playerInfo)

			// обновляю мир у клиентов
			sendWorldToAllClients(client.player.toJsonObject())
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
	fun worldToJsonArray() : JsonArray<Any> {
		val world = JsonArray<Any>()
		webSockets.forEach { world.add(it.player.toJsonObject()) }
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
		val me = Thread.currentThread();

		while (!me.isInterrupted) {
			// расчет времени
			val delta = (System.nanoTime() - serverLastTime) / 1_000_000.0
			serverLastTime = System.nanoTime()

			// для каждого клиента пересчитываю координаты
			webSockets.forEach { it.player.update(delta) }

			// надо поспать чтобы не вешать сервер
			Thread.sleep(10)
		}
	}
}