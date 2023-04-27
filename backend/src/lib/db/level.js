import { Level } from "level"

export default function (path) {
  const db = new Level(path, { valueEncoding: "json" })

  return {
    name: "leveldb",
    signals: {
      Update: async (entry) => {
        await db.put(entry.epoch, {
          ...entry,
        })
      },
    },
    load: async (limit = 50) => {
      const r = []
      for await (const entry of db.iterator()) {
        r.push(entry)
        if (--limit === 0) {
          break
        }
      }
      return r
    },
    close: async () => {},
  }
}
