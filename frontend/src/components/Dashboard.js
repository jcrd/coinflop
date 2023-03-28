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
      const data = lastMessage.data
      const json = JSON.parse(data)
      const setHist = history[Number(json.interval)]
      setHist((prev) => {
        if (prev.length === maxHistoryLength) {
          prev.shift()
        }
        return prev.concat(json)
      })
    }
  }, [lastMessage, setHistory1m, setHistory3m, setHistory5m])

  return (
    <div className="flex">
      <Chart history={history1m} />
    </div>
  )
}

export default Dashboard
