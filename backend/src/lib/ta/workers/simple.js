import { BollingerBands } from "@debut/indicators"

import { StochRSI } from "../indicators/stoch_rsi.js"
import { HMA } from "../indicators/hma.js"

import { KlineWorker } from "../worker.js"

const hmaPeriod = {
  1: 100,
  3: 50,
  5: 50,
}

function hmaCriteria(interval) {
  return {
    name: "hma",
    indicator: new HMA(hmaPeriod[interval]),
    predicate: (v, close) => {
      return {
        state: { up: close > v, down: close < v },
        values: { close, hma: v },
      }
    },
    interval: interval,
  }
}

const worker = KlineWorker([
  {
    name: "bbands",
    indicator: new BollingerBands(10, 2),
    predicate: (v, close) => {
      return {
        state: { up: close < v.upper, down: close > v.lower },
        values: { close, ...v },
      }
    },
    interval: 1,
  },
  {
    name: "stochRSI",
    indicator: new StochRSI(),
    predicate: ({ k, d }, close) => {
      return {
        state: {
          up: k > d && k > 0.3 && k < 0.7,
          down: k < d && k > 0.3 && k < 0.7,
        },
        values: { close, k, d },
      }
    },
    interval: 1,
  },
  hmaCriteria(1),
  hmaCriteria(3),
  hmaCriteria(5),
])

await worker()
