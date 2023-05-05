// Jack be nimble, Jack be quick, Jack predict these candlesticks!

import { Streak } from "../ta/indicators/streak.js"
import { TEMA } from "../ta/indicators/tema.js"
import { KlineWorker } from "../ta/worker.js"

function TEMACrossovers(p1, p2) {
  const tema1 = new TEMA(p1)
  const tema2 = new TEMA(p2)
  return {
    nextValue: (v) => {
      const v1 = tema1.nextValue(v)
      const v2 = tema2.nextValue(v)
      if (v1 === undefined || v2 === undefined) {
        return undefined
      }
      return { tema1: v1, tema2: v2 }
    },
  }
}

function TEMAPredicate({ tema1, tema2 }) {
  return {
    state: {
      up: tema1 > tema2,
      down: tema1 <= tema2,
    },
    values: { tema1, tema2 },
  }
}

const worker = KlineWorker([
  {
    name: "Streak5",
    indicator: new Streak(5),
    predicate: ({ direction, full, streak }) => {
      return {
        state: {
          up: direction === 1 && full,
          down: direction === -1 && full,
        },
        values: { direction, full, streak },
      }
    },
    interval: 3,
  },
  {
    name: "TEMA50v100",
    indicator: TEMACrossovers(50, 100),
    predicate: TEMAPredicate,
    interval: 3,
  },
  {
    name: "TEMA100v200",
    indicator: TEMACrossovers(100, 200),
    predicate: TEMAPredicate,
    interval: 3,
  },
])

await worker()
