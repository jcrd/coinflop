import { WebSocketServer } from "ws"

import { Signals } from "./enums.js"
import { newFixedArray } from "./utils.js"

import Logger from "./logger.js"

export default function runServer(loop, history, queueSize = 600) {
  const wss = new WebSocketServer({ port: 8000 })

  const queues = {
    broadcast: newFixedArray(queueSize),
    wsLogger: newFixedArray(queueSize),
    history: newFixedArray(queueSize),
  }

  let broadcastWs

  loop.addObserver({
    name: "broadcastQueue",
    signals: {
      [Signals.Broadcast]: (data) => {
        queues.broadcast.add(data)
      },
    },
  })

  loop.addObserver(
    Logger(history, "wsLoggerQueue", (msg) =>
      queues.wsLogger.add({ type: "log", message: msg })
    )
  )

  history.addObserver({
    name: "historyQueue",
    signals: {
      Update: (epoch, value) =>
        queues.history.add({ type: "history", epoch: epoch, ...value }),
    },
  })

  wss.on("connection", (ws) => {
    if (broadcastWs) {
      loop.removeObserver("broadcast")
      loop.removeObserver("wsLogger")
      loop.removeObserver("history")
      broadcastWs.close()
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

    loop.addObserver(
      Logger(history, "wsLogger", (msg) =>
        broadcastWs.send(JSON.stringify([{ type: "log", message: msg }]))
      )
    )

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
      loop.removeObserver("broadcast")
      loop.removeObserver("wsLogger")
      history.removeObserver("history")
      broadcastWs.close()
    }
    loop.removeObserver("broadcastQueue")
    loop.removeObserver("wsLoggerQueue")
    history.removeObserver("historyQueue")
    wss.close()
  }
}
