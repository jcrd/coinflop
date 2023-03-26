export default function (criteria) {
  let unmetCriteria = criteria.length
  let passing = null

  function update(interval, close) {
    const results = {}

    for (const crit of criteria.filter((c) => c.interval == interval)) {
      const r = crit.predicate(close)

      if (!r) {
        results[crit.name] = { state: null, values: {} }
        continue
      }

      results[crit.name] = r

      if (passing != crit.state) {
        unmetCriteria += passing ? -1 : 1
        crit.state = passing
      }
    }

    if (unmetCriteria == 0) {
      passing = true
    } else if (passing != null) {
      passing = false
    }

    return {
      state: passing,
      criteria: results,
    }
  }

  return {
    update,
  }
}
