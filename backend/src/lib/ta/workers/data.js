import { BollingerBands, SMA, MACD, RSI } from "@debut/indicators"

import { StochRSI } from "../indicators/stoch_rsi.js"

import { KlineWorker } from "../worker.js"

function genSMA(interval) {
  return [10, 20, 30, 50, 100, 200].map((period) => ({
    name: `SMA${period}`,
    indicator: new SMA(period),
    predicate: (v, close) => ({
      state: { up: close > v, down: close < v },
      values: { close, sma: v },
    }),
    interval: interval,
  }))
}

function genCriteria(interval) {
  return [
    {
      name: "bbands",
      indicator: new BollingerBands(10, 2),
      predicate: (v, close) => ({
        state: { up: close < v.upper, down: close > v.lower },
        values: { close, ...v },
      }),
      interval: interval,
    },
    {
      name: "stochRSI",
      indicator: new StochRSI(),
      predicate: ({ k, d }, close) => ({
        state: {
          up: k > d && k > 30 && k < 70,
          down: k < d && k > 30 && k < 70,
        },
        values: { close, k, d },
      }),
      interval: interval,
    },
    {
      name: "RSI",
      indicator: new RSI(),
      predicate: (v, close) => ({
        state: { up: v > 30 && v < 70, down: v > 30 && v < 70 },
        values: { close, rsi: v },
      }),
      interval: interval,
    },
    {
      name: "MACD",
      indicator: new MACD(),
      predicate: ({ macd, signal }, close) => ({
        state: { up: macd > signal, down: macd < signal },
        values: { close, macd, signal },
      }),
      interval: interval,
    },
    ...genSMA(interval),
  ]
}

const worker = KlineWorker([1, 3, 5, 15, 30, 60].map(genCriteria).flat())

await worker()
