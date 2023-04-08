export function arrayTransformer() {
  const data = {}

  return {
    define: (def) => {
      data[def.name] = def
    },
    get: (name) => data[name].state[0],
    update: (newData) => {
      const staging = {}

      for (const name in data) {
        staging[name] = []
      }

      newData.forEach((v) => {
        for (const [name, value] of Object.entries(data)) {
          if (!("cond" in value) || value.cond(v)) {
            staging[name].push(value.transform(v))
          }
        }
      })

      for (const [name, value] of Object.entries(data)) {
        value.state[1](staging[name])
      }
    },
  }
}
