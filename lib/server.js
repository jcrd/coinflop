import { WebSocketServer } from "ws"

import { Signals } from "./enums.js"

export default function runServer(loop, queueSize = 50) {
  const wss = new WebSocketServer({ port: 8000 })
  let broadcastQueue = []
  let broadcastWs

  loop.addObserver({
    name: "broadcastQueue",
    signals: {
      [Signals.Broadcast]: (data) => {
        if (broadcastQueue.length == queueSize) {
          broadcastQueue.shift()
        }
        broadcastQueue.push(JSON.stringify(data))
      },
    },
  })

  wss.on("connection", (ws) => {
    if (broadcastWs) {
      loop.removeObserver("broadcast")
      broadcastWs.close()
    }
    broadcastWs = ws

    for (const json of broadcastQueue) {
      broadcastWs.send(json)
    }

    loop.addObserver({
      name: "broadcast",
      signals: {
        [Signals.Broadcast]: (data) => {
          broadcastWs.send(JSON.stringify(data))
        },
      },
    })
  })

  return () => {
    if (broadcastWs) {
      loop.removeObserver("broadcast")
      broadcastWs.close()
    }
    loop.removeObserver("broadcastQueue")
    wss.close()
  }
}
