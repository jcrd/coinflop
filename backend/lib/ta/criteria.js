const defState = { up: null, down: null }

function reduceState(states) {
  let ups = 0
  let downs = 0

  for (let { up, down } of states) {
    if (up) {
      ups++
    }
    if (down) {
      downs++
    }
  }

  if (ups === states.length) {
    return true
  } else if (downs === states.length) {
    return false
  }
  return null
}

export default function (criteria) {
  const criteriaState = {}

  function nextValue(interval, close) {
    const results = {}

    for (const c of criteria.filter((c) => c.interval == interval)) {
      const r = c.predicate(close)

      if (!r) {
        results[c.name] = { state: defState, values: {} }
        continue
      }

      results[c.name] = r
      c.state = r.state
    }

    criteriaState[interval] = results

    return {
      // This state can be true, false, or null.
      direction: reduceState(criteria.map((c) => c.state || defState)),
      criteria: criteriaState,
    }
  }

  return {
    nextValue,
  }
}
