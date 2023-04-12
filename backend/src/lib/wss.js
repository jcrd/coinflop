import { WebSocketServer } from "ws"

import { Signals } from "./enums.js"
import { newFixedArray } from "./utils.js"

import { Logger, HistoryLogger } from "./logger.js"

export default function runWSServer(loop, history, queueSize = 600) {
  const wss = new WebSocketServer({ noServer: true })

  const queues = {
    broadcast: newFixedArray(queueSize),
    wsLogger: newFixedArray(queueSize),
    history: newFixedArray(queueSize),
  }

  let websockets = []

  function sendAll(data) {
    websockets.forEach((ws) => ws.send(data))
  }

  const logger = (msg) => {
    queues.wsLogger.add({ type: "log", message: msg })
    sendAll(JSON.stringify([{ type: "log", message: msg }]))
  }

  loop.addObserver({
    name: "broadcastQueue",
    signals: {
      [Signals.Broadcast]: (data) => {
        queues.broadcast.add(data)
        sendAll(JSON.stringify([data]))
      },
    },
  })

  loop.addObserver(Logger("wsLoggerQueue", logger))
  history.addObserver(HistoryLogger("wsHistoryLoggerQueue", logger))

  wss.on("connection", (ws) => {
    websockets.push(ws)
    ws.on("close", () => {
      websockets = websockets.filter((s) => s !== ws)
    })

    for (const name in queues) {
      const json = JSON.stringify(queues[name])
      ws.send(json)
    }
  })

  return {
    upgrade: (req, socket, head) => {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req)
      })
    },
    close: () => {
      websockets.forEach((ws) => ws.close())

      loop.removeObserver("broadcastQueue")
      loop.removeObserver("wsLoggerQueue")
      history.removeObserver("wsHistoryLoggerQueue")

      wss.close()
    },
  }
}
