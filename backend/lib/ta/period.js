import { newFixedArray } from "../utils.js"

export default class Period {
  constructor(length) {
    this.values = newFixedArray(length)
    this.full = false
  }

  nextValue(value) {
    this.full = this.values.add(value)
    return this.full
  }

  lowest() {
    return Math.min(...this.values)
  }

  highest() {
    return Math.max(...this.values)
  }
}
