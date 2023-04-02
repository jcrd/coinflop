import React, { useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"

import CandleChart from "./CandleChart.js"
import LineChart from "./LineChart.js"
import Status from "./Status.js"
import RoundHistory from "./RoundHistory.js"

const WS_URL = "ws://127.0.0.1:8000"

const Dashboard = () => {
  const { lastMessage } = useWebSocket(WS_URL)

  const [history1m, setHistory1m] = useState([])
  const [history3m, setHistory3m] = useState([])
  const [history5m, setHistory5m] = useState([])

  const [logMessages, setLogMessages] = useState([])
  const [roundHistory, setRoundHistory] = useState([])

  const [statusData, setStatusData] = useState({
    state: null,
    timestamp: 0,
    1: {
      bbands: { state: null, values: {} },
      stochRSI: { state: null, values: {} },
      hma: { state: null, values: {} },
    },
    3: {
      hma: { state: null, values: {} },
    },
    5: {
      hma: { state: null, values: {} },
    },
  })

  useEffect(() => {
    if (lastMessage === null) {
      return
    }

    function concat(set, msg, size = 50) {
      set((prev) => {
        if (prev.length === size) {
          prev.shift()
        }
        return prev.concat(msg)
      })
    }

    const history = {
      1: setHistory1m,
      3: setHistory3m,
      5: setHistory5m,
    }

    const data = JSON.parse(lastMessage.data)
    for (const json of data) {
      if (json.type === "log") {
        concat(setLogMessages, json)
        continue
      }

      if (json.type === "history") {
        concat(setRoundHistory, json)
        continue
      }

      concat(history[json.interval], json)

      if (json.interval === 1) {
        setStatusData((prev) => {
          return {
            ...prev,
            state: json.state,
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
            state: json.state,
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
            state: json.state,
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
