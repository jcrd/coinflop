import { Level } from "level"

import { Direction, Signals } from "./enums.js"

const db = new Level("db/history", { valueEncoding: "json" })
export const globalHistory = {}

for await (const [key, value] of db.iterator()) {
  globalHistory[key] = value
}

export async function recordBet(epoch, direction, amount) {
  globalHistory[epoch] = { bet: direction, amount: amount }
  await db.put(epoch, globalHistory[epoch])
}

export async function skipBet(epoch) {
  globalHistory[epoch] = { skipped: true }
  await db.put(epoch, globalHistory[epoch])
}

const signals = {}

signals[Signals.Round.Close] = async (round) => {
  const epoch = round.epoch
  const result =
    round.closePrice > round.lockPrice ? Direction.Bull : Direction.Bear
  if (epoch in globalHistory) {
    const entry = globalHistory[epoch]
    entry.result = result
    entry.win = result == entry.bet
  } else {
    globalHistory[epoch] = { result: result }
  }
  await db.put(epoch, globalHistory[epoch])
}

export default {
  name: "history",
  signals,
}
