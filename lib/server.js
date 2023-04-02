import { WebSocketServer } from "ws"

import { Signals } from "./enums.js"
import { newFixedArray } from "./utils.js"

import { Logger, HistoryLogger } from "./logger.js"

export default function runServer(loop, history, queueSize = 600) {
  const wss = new WebSocketServer({ port: 8000 })

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

  const historyQueue = (epoch, value) =>
    queues.history.add({ type: "history", epoch: epoch, ...value })

  history.addObserver({
    name: "historyQueue",
    signals: {
      Update: (epoch, value) => {
        historyQueue(epoch, value)
        sendAll(JSON.stringify([{ type: "history", epoch: epoch, ...value }]))
      },
      Load: historyQueue,
    },
  })
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

  return () => {
    websockets.forEach((ws) => ws.close())

    loop.removeObserver("broadcastQueue")
    loop.removeObserver("wsLoggerQueue")
    history.removeObserver("historyQueue")
    history.removeObserver("wsHistoryLoggerQueue")

    wss.close()
  }
}
