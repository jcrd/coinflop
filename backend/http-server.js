import { parentPort, workerData } from "worker_threads"
import * as path from "path"

import express from "express"

parentPort.on("message", (data) => {
  if (data.exit) {
    process.exit(0)
  }
})

const app = express()
const port = process.env.SERVER_PORT || 9000

app.get("/status", (_, res) => {
  res.send("OK")
})

if (workerData.frontend) {
  app.use(express.static("frontend"))

  app.get("/", function (_, res) {
    res.sendFile(path.join("frontend", "index.html"))
  })

  console.log(`Running frontend on port: ${port}`)
} else {
  console.log(`Running HTTP server on port: ${port}`)
}

app.listen(port)
