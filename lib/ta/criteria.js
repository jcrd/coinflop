export default function (criteria) {
  function update(interval, close) {
    const results = {}

    for (const crit of criteria.filter((c) => c.interval == interval)) {
      const r = crit.predicate(close)

      if (!r) {
        results[crit.name] = { state: null, values: {} }
        continue
      }

      results[crit.name] = r
      crit.state = r.state
    }

    return {
      state: criteria.reduce((prev, c) => prev && c.state, false),
      criteria: results,
    }
  }

  return {
    update,
  }
}
