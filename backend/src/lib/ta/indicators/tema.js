import { EMA } from "@debut/indicators"

export class TEMA {
  constructor(period) {
    this.emas = [
      { i: new EMA(period), v: 0 },
      { i: new EMA(period), v: 0 },
      { i: new EMA(period), v: 0 },
    ]
  }

  nextValue(value) {
    for (const ema of this.emas) {
      value = ema.i.nextValue(value)
      if (value === undefined) {
        return undefined
      }
      ema.v = value
    }
    return this.emas[0].v * 3 - this.emas[1].v * 3 + this.emas[2].v
  }
}
