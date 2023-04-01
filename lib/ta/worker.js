import { parentPort } from "worker_threads"

import Criteria from "./criteria.js"
import Klines from "./klines.js"

export function KlineWorker(cs) {
  const criteria = Criteria(cs)
  const klines = new Klines()
  const intervals = new Set()
  cs.forEach((c) => intervals.add(c.interval))

  klines.addObserver({
    name: "klines",
    signals: {
      Update: (interval, kline) => {
        const result = criteria.update(interval, kline.ohlc.close)
        parentPort.postMessage({
          interval: interval,
          ...kline,
          ...result,
        })
      },
    },
  })

  return async () => {
    parentPort.on("message", (data) => {
      if (data.exit) {
        klines.close()
        process.exit(0)
      }
    })

    for (const i of intervals) {
      await klines.subscribe(i)
    }
  }
}
