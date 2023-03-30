import { WebSocketServer } from "ws"

import { Signals } from "./enums.js"
import { newFixedArray } from "./utils.js"

import Logger from "./logger.js"

export default function runServer(loop, queueSize = 600) {
  const wss = new WebSocketServer({ port: 8000 })
  let broadcastQueue = newFixedArray(queueSize)
  let broadcastWs

  loop.addObserver({
    name: "broadcastQueue",
    signals: {
      [Signals.Broadcast]: (data) => {
        broadcastQueue.add(data)
      },
    },
  })

  loop.addObserver(
    Logger("wsLoggerQueue", (msg) => broadcastQueue.add({ logMessage: msg }))
  )

  wss.on("connection", (ws) => {
    if (broadcastWs) {
      loop.removeObserver("broadcast")
      loop.removeObserver("wsLogger")
      broadcastWs.close()
    }
    broadcastWs = ws

    const json = JSON.stringify(broadcastQueue)
    broadcastWs.send(json)

    loop.addObserver({
      name: "broadcast",
      signals: {
        [Signals.Broadcast]: (data) => {
          broadcastWs.send(JSON.stringify([data]))
        },
      },
    })

    loop.addObserver(
      Logger("wsLogger", (msg) =>
        broadcastWs.send(JSON.stringify([{ logMessage: msg }]))
      )
    )
  })

  return () => {
    if (broadcastWs) {
      loop.removeObserver("broadcast")
      loop.removeObserver("wsLogger")
      broadcastWs.close()
    }
    loop.removeObserver("broadcastQueue")
    loop.removeObserver("wsLoggerQueue")
    wss.close()
  }
}
