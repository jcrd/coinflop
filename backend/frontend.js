import { parentPort } from "worker_threads"
import * as path from "path"

import express from "express"

const app = express()
app.use(express.static("frontend"))

app.get("/", function (_, res) {
  res.sendFile(path.join("frontend", "index.html"))
})

parentPort.on("message", (data) => {
  if (data.exit) {
    process.exit(0)
  }
})

const port = process.env.FRONTEND_PORT || 9000

console.log(`Running frontend on port: ${port}`)

app.listen(port)
