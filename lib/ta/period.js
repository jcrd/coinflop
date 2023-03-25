import { newFixedArray } from "../utils.js"

export default class Period {
  constructor(length) {
    this.values = newFixedArray(length)
    this.full = false
    this.highest
    this.lowest
  }

  nextValue(value) {
    if (this.values.add(value)) {
      this.full = true
    }
    this.lowest = Math.min(...this.values)
    this.highest = Math.max(...this.values)
    return this.full
  }
}
