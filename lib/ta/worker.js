import { parentPort } from "worker_threads"

import Criteria from "./criteria.js"
import Klines from "./klines.js"

export function KlineWorker(cs) {
  const criteria = Criteria(cs)
  const klines = Klines()
  const intervals = new Set()
  cs.forEach((c) => intervals.add(c.interval))

  return async () => {
    parentPort.on("message", (data) => {
      if (data.exit) {
        klines.close()
        process.exit(0)
      }
    })

    for (const i of intervals) {
      await klines.on(i, (kline) => {
        const result = criteria.update(i, kline.ohlc.close)
        parentPort.postMessage({
          interval: i,
          ...kline,
          ...result,
        })
      })
    }
  }
}
