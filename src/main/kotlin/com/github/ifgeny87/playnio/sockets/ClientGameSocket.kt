package com.github.ifgeny87.playnio.sockets

import com.beust.klaxon.JsonObject
import com.beust.klaxon.Parser
import com.beust.klaxon.json
import com.github.ifgeny87.playnio.controllers.GameController
import com.github.ifgeny87.playnio.actors.Player
import org.eclipse.jetty.websocket.WebSocket
import org.slf4j.LoggerFactory
import java.util.*

/**
 * Объект содержит информацию о клиенте.
 * Здесь же будем хранить хранилище соединения и объект игрока
 *
 */
class ClientGameSocket(val gameController: GameController) : WebSocket.OnTextMessage {

	// logger
	private val log = LoggerFactory.getLogger(ClientGameSocket::class.java)

	// хранилище соединения
	private var connection: WebSocket.Connection? = null

	// каждый клиент это игрок
	val player = Player(UUID.randomUUID().toString())

	/**
	 * Обработка события нового соединения с клиентом
	 */
	override fun onOpen(connection: WebSocket.Connection?) {
		log.info("Сокет открылся: ${connection}")
		this.connection = connection
		gameController.onClientConnect(this)
	}

	/**
	 * Обработка отключения клиента
	 */
	override fun onClose(closeCode: Int, message: String?) {
		log.info("Сокет закрылся: ${connection}")
		gameController.onClientDisconnect(this)
	}

	/**
	 * Обработка события получения нового сообщения от клиента
	 */
	override fun onMessage(text: String) {
		log.debug("Пришло сообщение: ${text}")
		val parser = Parser()
		val jsonObject = parser.parse(StringBuilder(text)) as JsonObject
		gameController.onClientMessage(this, jsonObject)
	}

	/**
	 * Оправка сообщения клиенту
	 */
	fun sendMessage(jsonObject: JsonObject) {
		val text = jsonObject.toJsonString()
		log.info("Отправляю сообщение: ${text}")
		connection?.sendMessage(text)
	}
}