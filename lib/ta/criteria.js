export default function (criteria) {
  let unmetCriteria = criteria.length
  let passing = null

  function update(interval, close) {
    const results = []

    for (const crit of criteria.filter((c) => c.interval == interval)) {
      const header = {
        name: crit.name,
      }

      const r = crit.predicate(close)

      if (!r) {
        results.push({
          ...header,
          values: {},
          state: null,
        })
        continue
      }

      const [values, state] = r
      results.push({
        ...header,
        values,
        state,
      })

      if (state != crit.state) {
        unmetCriteria += state ? -1 : 1
        crit.state = state
      }
    }

    if (unmetCriteria == 0) {
      passing = true
    } else if (passing != null) {
      passing = false
    }

    return {
      state: passing,
      results,
    }
  }

  return {
    update,
  }
}
