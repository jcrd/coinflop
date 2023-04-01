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

  let broadcastWs

  const wsLogQueue = (msg) => queues.wsLogger.add({ type: "log", message: msg })
  const wsLog = (msg) =>
    broadcastWs.send(JSON.stringify([{ type: "log", message: msg }]))

  const historyQueue = (epoch, value) =>
    queues.history.add({ type: "history", epoch: epoch, ...value })

  function cleanupWs() {
    loop.removeObserver("broadcast")
    loop.removeObserver("wsLogger")
    history.removeObserver("wsHistoryLogger")
    history.removeObserver("history")
    broadcastWs.close()
  }

  loop.addObserver({
    name: "broadcastQueue",
    signals: {
      [Signals.Broadcast]: (data) => {
        queues.broadcast.add(data)
      },
    },
  })

  loop.addObserver(Logger("wsLoggerQueue", wsLogQueue))
  history.addObserver(HistoryLogger("wsHistoryLoggerQueue", wsLogQueue))

  history.addObserver({
    name: "historyQueue",
    signals: {
      Update: historyQueue,
      Load: historyQueue,
    },
  })

  wss.on("connection", (ws) => {
    if (broadcastWs) {
      cleanupWs()
    }

    broadcastWs = ws

    for (const name in queues) {
      const json = JSON.stringify(queues[name])
      broadcastWs.send(json)
    }

    loop.addObserver({
      name: "broadcast",
      signals: {
        [Signals.Broadcast]: (data) => {
          broadcastWs.send(JSON.stringify([data]))
        },
      },
    })

    loop.addObserver(Logger("wsLogger", wsLog))
    history.addObserver(HistoryLogger("wsHistoryLogger", wsLog))

    history.addObserver({
      name: "history",
      signals: {
        Update: (epoch, value) =>
          broadcastWs.send(
            JSON.stringify([{ type: "history", epoch: epoch, ...value }])
          ),
      },
    })
  })

  return () => {
    if (broadcastWs) {
      cleanupWs()
    }
    loop.removeObserver("broadcastQueue")
    loop.removeObserver("wsLoggerQueue")
    history.removeObserver("wsHistoryLoggerQueue")
    history.removeObserver("historyQueue")
    wss.close()
  }
}
