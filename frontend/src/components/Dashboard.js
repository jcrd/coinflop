import React, { useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"

import CandleChart from "./CandleChart.js"
import LineChart from "./LineChart.js"
import Status from "./Status.js"

const WS_URL = `${process.env.REACT_APP_WS_URL}${
  process.env.REACT_APP_WS_PORT || ""
}`

const Dashboard = () => {
  const { lastMessage } = useWebSocket(WS_URL)

  const [history1m, setHistory1m] = useState([])
  const [history3m, setHistory3m] = useState([])
  const [history5m, setHistory5m] = useState([])

  const [logMessages, setLogMessages] = useState([])

  const defState = { state: { up: false, down: false }, values: {} }
  const [statusData, setStatusData] = useState({
    direction: null,
    timestamp: 0,
    1: {
      bbands: defState,
      stochRSI: defState,
      hma: defState,
    },
    3: {
      hma: defState,
    },
    5: {
      hma: defState,
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

      if (json.interval in history) {
        concat(history[json.interval], {
          ...json,
          criteria: json.criteria[json.interval],
        })
      }

      setStatusData({
        direction: json.direction,
        timestamp: json.closeTime,
        ...("criteria" in json ? json.criteria : {}),
      })
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
      </div>
    </div>
  )
}

export default Dashboard
