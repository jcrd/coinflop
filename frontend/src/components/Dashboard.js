import React, { useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"

import CandleChart from "./CandleChart.js"
import LineChart from "./LineChart.js"
import Status from "./Status.js"

const WS_URL = "ws://127.0.0.1:8000"

const maxHistoryLength = 50

const Dashboard = () => {
  const { lastMessage } = useWebSocket(WS_URL)
  const [history1m, setHistory1m] = useState([])
  const [history3m, setHistory3m] = useState([])
  const [history5m, setHistory5m] = useState([])

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

  const [logMessages, setLogMessages] = useState([])

  useEffect(() => {
    if (lastMessage === null) {
      return
    }

    const history = {
      1: setHistory1m,
      3: setHistory3m,
      5: setHistory5m,
    }

    const data = JSON.parse(lastMessage.data)
    for (const json of data) {
      if ("logMessage" in json) {
        setLogMessages((prev) => {
          if (prev.length === maxHistoryLength) {
            prev.shift()
          }
          return prev.concat(json.logMessage)
        })
        continue
      }

      const setHist = history[json.interval]

      setHist((prev) => {
        if (prev.length === maxHistoryLength) {
          prev.shift()
        }
        return prev.concat(json)
      })

      if (json.interval === 1) {
        console.log(json)
        setStatusData((prev) => {
          return {
            ...prev,
            passing: json.state,
            timestamp: json.timestamp,
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
            timestamp: json.timestamp,
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
            timestamp: json.timestamp,
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
      ></Status>
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
