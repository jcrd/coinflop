function reduceState(state) {
  let trues = 0
  let falses = 0

  for (const s of state) {
    if (s === true) {
      trues++
    } else if (s === false) {
      falses++
    }
  }
  if (trues === state.length) {
    return true
  }
  if (falses === state.length) {
    return false
  }
  return null
}

export default function (criteria) {
  function update(interval, close) {
    const results = {}

    for (const c of criteria.filter((c) => c.interval == interval)) {
      const r = c.predicate(close)

      if (!r) {
        results[c.name] = { state: null, values: {} }
        continue
      }

      // This state can be true, false, or null.
      r.state = reduceState(r.state)
      results[c.name] = r
      c.state = r.state
    }

    return {
      // This state can be true, false, or null.
      state: reduceState(criteria.map((c) => c.state)),
      criteria: results,
    }
  }

  return {
    update,
  }
}
