import { newFixedArray } from "../../utils.js"

export class Streak {
  constructor(period) {
    this.maxStreak = period - 1
    this.period = newFixedArray(period)
  }

  nextValue(value) {
    if (!this.period.add(value)) {
      return undefined
    }

    let direction
    let streak = 0
    this.period.reduce((prev, v) => {
      const d = v > prev
      if (v === prev || d === direction) {
        streak++
      } else {
        direction = d
        streak = 1
      }
      return v
    })

    if (direction === undefined) {
      return undefined
    }

    return {
      direction: direction ? 1 : -1,
      streak,
      full: streak === this.maxStreak,
    }
  }
}
