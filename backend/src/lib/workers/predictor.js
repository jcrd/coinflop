import WebSocket from "ws"
import { parentPort, workerData as URL } from "worker_threads"

const ws = new WebSocket(URL)

ws.on("message", (data) => {
  data = JSON.parse(data)
  const direction = data.prediction === 1 ? true : false
  delete data.prediction
  parentPort.postMessage({
    interval: 1,
    direction,
    criteria: data,
  })
})

parentPort.on("message", (data) => {
  if (data.exit) {
    ws.close()
    process.exit(0)
  }
})
