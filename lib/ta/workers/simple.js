import { BollingerBands } from "@debut/indicators"

import { KlineWorker } from "../worker.js"

const indicators = {
  1: {
    bbands: new BollingerBands(10, 2),
  },
}

const worker = KlineWorker([
  {
    name: "bbands",
    predicate: (close) => {
      const v = indicators[1].bbands.nextValue(close)
      if (!v) {
        return null
      }
      return { state: close < v.upper, values: v }
    },
    interval: 1,
  },
])

await worker()
