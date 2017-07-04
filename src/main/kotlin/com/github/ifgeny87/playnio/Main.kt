package com.github.ifgeny87.playnio

import com.beust.klaxon.json
import com.github.ifgeny87.playnio.controllers.GameController
import com.github.ifgeny87.playnio.sockets.ClientGameSocket
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.websocket.WebSocket
import org.eclipse.jetty.websocket.WebSocketHandler
import org.slf4j.LoggerFactory
import javax.servlet.http.HttpServletRequest

// порт сервера
val SERVER_PORT = 3333

fun main(args: Array<String>) {
	// создаем игровой контроллер сервера
	val gameController = GameController()

	// создаем хендлер сообщений
	val handler = ServerHandler(gameController)

	// запускаем сервер
	val jettyServer = Server(SERVER_PORT)
	jettyServer.handler = handler
	jettyServer.start()

	// стартуем игровой контроллер
	Thread(gameController).start()
}

class ServerHandler(val gameController : GameController) : WebSocketHandler() {

	// logger
	private val log = LoggerFactory.getLogger(ServerHandler::class.java)

	/**
	 * Обработчик нового подключения
	 */
	override fun doWebSocketConnect(request: HttpServletRequest?, protocol: String?): WebSocket {
		log.info("Кто-то подключился: ${request}")
		val client = ClientGameSocket(gameController)
		return client
	}
}
