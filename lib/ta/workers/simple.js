import { BollingerBands, SMA } from "@debut/indicators"

import { StochRSI } from "../indicators/stoch_rsi.js"

import { KlineWorker } from "../worker.js"

const indicators = {
  1: {
    bbands: new BollingerBands(10, 2),
    stochRSI: new StochRSI(),
    sma: new SMA(3),
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
  {
    name: "stochRSI",
    predicate: (close) => {
      const k = indicators[1].stochRSI.nextValue(close)
      if (k === undefined) {
        return null
      }
      const d = indicators[1].sma.nextValue(k)
      if (d === undefined) {
        return null
      }
      return {
        state: k > d && k < 0.7 && k > 0.3,
        values: { k: k, d: d },
      }
    },
    interval: 1,
  },
])

await worker()
