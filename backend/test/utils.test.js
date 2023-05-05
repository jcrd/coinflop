import assert from "assert"

import { newFixedArray } from "../src/lib/utils.js"

const data = [1, 2, 3, 4, 5, 6, 7]

describe("newFixedArray", () => {
  it("should accurately report fullness", () => {
    const array = newFixedArray(data.length)
    const full = data.reduce((_, v) => array.add(v), false)
    assert.equal(full, true)
  })
})
