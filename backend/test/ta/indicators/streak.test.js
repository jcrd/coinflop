import assert from "assert"

import { Streak } from "../../../src/lib/ta/indicators/streak.js"

const data = {
  up1: [2, 1, 3, 4, 3, 5],
  up5: [2, 1, 3, 4, 3, 5, 6, 7, 8, 9],
  down1: [2, 1, 3, 4, 3, 5, 2],
  down5: [2, 1, 3, 4, 3, 6, 5, 4, 3, 2, 1],
}

function test(values, direction, streak) {
  return () => {
    const indicator = new Streak(6)
    const s = values.reduce((_, v) => indicator.nextValue(v), {})
    assert.equal(s.direction, direction)
    assert.equal(s.streak, streak)
  }
}

describe("streak", () => {
  it("should detect an up streak of 1", test(data.up1, 1, 1))
  it("should detect an up streak of 5", test(data.up5, 1, 5))
  it("should detect a down streak of 1", test(data.down1, -1, 1))
  it("should detect a down streak of 5", test(data.down5, -1, 5))
})
