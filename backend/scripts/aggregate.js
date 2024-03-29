import dotenv from "dotenv"
import { MongoClient } from "mongodb"

import { Direction } from "../src/lib/enums.js"

dotenv.config()

const database = process.env.MONGO_DATABASE
const collection = process.env.MONGO_COLLECTION

function addTACount(data, strategyName, interval, name) {
  const strat = strategyName in data ? data[strategyName] : {}
  const d = interval in strat ? strat[interval] : {}
  d[name] = name in d ? d[name] + 1 : 1
  strat[interval] = d
  data[strategyName] = strat
}

function addCount(data, strategyName) {
  data[strategyName] = strategyName in data ? data[strategyName] + 1 : 1
}

function calcPercent(data, rounds) {
  for (const [name, value] of Object.entries(data)) {
    if (typeof value === "number") {
      data[name] = Math.round((value / rounds) * 100)
      continue
    }
    for (const [_, intervalData] of Object.entries(value)) {
      for (const [name, count] of Object.entries(intervalData)) {
        intervalData[name] = Math.round((count / rounds) * 100)
      }
    }
  }
  return data
}

function calcRoundsWonPercent(data) {
  for (const [_, value] of Object.entries(data)) {
    value.accuracy = Math.round((value.roundsWon / value.roundsBet) * 100)
  }

  return data
}

const functions = {
  data_accuracy: async () => {
    let rounds = 0
    const data = {}
    const betData = {}

    await client
      .db(database)
      .collection(collection)
      .find()
      .forEach((entry) => {
        const state = entry.result === Direction.Bull ? "up" : "down"
        entry.bets.forEach((bet) => {
          if (bet.strategy !== (process.env.STRATEGY_NAME || "ta_data")) {
            return
          }
          if (Object.keys(bet.criteria).length === 0) {
            if (bet.direction === entry.result) {
              addCount(data, bet.strategy)
            }
            return
          }
          for (const [i, intervalData] of Object.entries(bet.criteria)) {
            for (const [name, criterionData] of Object.entries(intervalData)) {
              if (criterionData.state[state]) {
                addTACount(data, bet.strategy, i, name)
              }
            }
          }
          if (!(bet.strategy in betData)) {
            betData[bet.strategy] = { roundsBet: 0, roundsWon: 0 }
          }
          const d = betData[bet.strategy]
          if (bet.direction !== "Skip") {
            d.roundsBet += 1
          }
          if (bet.direction === entry.result) {
            d.roundsWon += 1
          }
        })
        rounds++
      })

    return {
      rounds,
      ...calcPercent(data, rounds),
      betAccuracy: calcRoundsWonPercent(betData),
    }
  },
}

const client = new MongoClient(process.env.MONGO_URL)
await client.connect()

const arg = process.argv[2] || "data_accuracy"

if (arg in functions) {
  console.log(arg, await functions[arg]())
} else {
  console.log(`Bad argument: ${arg}`)
}

await client.close()
