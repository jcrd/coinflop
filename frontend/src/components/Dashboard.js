import React, { useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"

import CandleChart from "./CandleChart.js"
import LineChart from "./LineChart.js"
import Status from "./Status.js"
import RoundHistory from "./RoundHistory.js"

const WS_URL = "ws://127.0.0.1:8000"

function fixedStateArray([get, set], size = 50) {
  const setConcat = (msg) =>
    set((prev) => {
      if (prev.length === size) {
        prev.shift()
      }
      return prev.concat(msg)
    })
  return [get, setConcat]
}

const Dashboard = () => {
  const { lastMessage } = useWebSocket(WS_URL)

  const [history1m, concatHistory1m] = fixedStateArray(useState([]))
  const [history3m, concatHistory3m] = fixedStateArray(useState([]))
  const [history5m, concatHistory5m] = fixedStateArray(useState([]))

  const [logMessages, concatLogMessages] = fixedStateArray(useState([]))
  const [roundHistory, concatRoundHistory] = fixedStateArray(useState([]))

  const [statusData, setStatusData] = useState({
    passing: false,
    timestamp: 0,
    1: {
      bbands: false,
      stochRSI: false,
      hma: false,
    },
    3: {
      hma: false,
    },
    5: {
      hma: false,
    },
  })

  useEffect(() => {
    if (lastMessage === null) {
      return
    }

    const history = {
      1: concatHistory1m,
      3: concatHistory3m,
      5: concatHistory5m,
    }

    const data = JSON.parse(lastMessage.data)
    for (const json of data) {
      if (json.type === "log") {
        concatLogMessages(json)
        continue
      }

      if (json.type === "history") {
        concatRoundHistory(json)
        continue
      }

      history[json.interval](json)

      if (json.interval === 1) {
        setStatusData((prev) => {
          return {
            ...prev,
            passing: json.state,
            timestamp: json.closeTime,
            1: {
              bbands: json.criteria.bbands.state,
              stochRSI: json.criteria.stochRSI.state,
              hma: json.criteria.hma.state,
            },
          }
        })
      }
      if (json.interval === 3) {
        setStatusData((prev) => {
          return {
            ...prev,
            passing: json.state,
            timestamp: json.closeTime,
            3: {
              hma: json.criteria.hma.state,
            },
          }
        })
      }
      if (json.interval === 5) {
        setStatusData((prev) => {
          return {
            ...prev,
            passing: json.state,
            timestamp: json.closeTime,
            5: {
              hma: json.criteria.hma.state,
            },
          }
        })
      }
    }
  }, [lastMessage])

  return (
    <div className="grid grid-cols-5 h-screen">
      <Status
        className="col-span-1"
        data={statusData}
        logMessages={logMessages}
      />
      <div className="col-span-4 grid grid-cols-3 grid-rows-2 h-screen">
        <div className="flex flex-col pt-6">
          <h1 className="text-xl">1m</h1>
          <CandleChart history={history1m} />
        </div>
        <div className="flex flex-col pt-6">
          <h1 className="text-xl">3m</h1>
          <CandleChart history={history3m} />
        </div>
        <div className="flex flex-col pt-6">
          <h1 className="text-xl">5m</h1>
          <CandleChart history={history5m} />
        </div>
        <LineChart history={history1m} />
        <div className="col-span-2 my-auto">
          <RoundHistory data={roundHistory} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
