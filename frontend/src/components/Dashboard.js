import React, { useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"

import Chart from "./Chart.js"

const WS_URL = "ws://127.0.0.1:8000"

const maxHistoryLength = 50

const Dashboard = () => {
  const { lastMessage } = useWebSocket(WS_URL)
  const [history1m, setHistory1m] = useState([])
  const [history3m, setHistory3m] = useState([])
  const [history5m, setHistory5m] = useState([])

  useEffect(() => {
    const history = {
      1: setHistory1m,
      3: setHistory3m,
      5: setHistory5m,
    }

    if (lastMessage !== null) {
      // Sort messages by interval for appropriate chart.
      const data = JSON.parse(lastMessage.data)
      for (const json of data) {
        const setHist = history[Number(json.interval)]
        setHist((prev) => {
          if (prev.length === maxHistoryLength) {
            prev.shift()
          }
          return prev.concat(json)
        })
      }
    }
  }, [lastMessage])

  return (
    <div className="grid grid-cols-3 grid-rows-2 h-screen">
      <Chart interval={1} history={history1m} />
      <Chart interval={3} history={history3m} />
      <Chart interval={5} history={history5m} />
    </div>
  )
}

export default Dashboard
