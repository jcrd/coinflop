import { BollingerBands, SMA } from "@debut/indicators"

import { StochRSI } from "../indicators/stoch_rsi.js"
import { HMA } from "../indicators/hma.js"

import { KlineWorker } from "../worker.js"

const indicators = {
  1: {
    bbands: new BollingerBands(10, 2),
    stochRSI: new StochRSI(),
    sma: new SMA(3),
    hma: new HMA(100),
  },
  3: {
    hma: new HMA(50),
  },
  5: {
    hma: new HMA(50),
  },
}

function hmaCriteria(interval) {
  return {
    name: "hma",
    predicate: (close) => {
      const v = indicators[interval].hma.nextValue(close)
      if (v === undefined) {
        return null
      }
      return {
        state: close > v,
        values: { hma: v },
      }
    },
    interval: interval,
  }
}

const worker = KlineWorker([
  {
    name: "bbands",
    predicate: (close) => {
      const v = indicators[1].bbands.nextValue(close)
      if (v === undefined) {
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
  hmaCriteria(1),
  hmaCriteria(3),
  hmaCriteria(5),
])

await worker()
