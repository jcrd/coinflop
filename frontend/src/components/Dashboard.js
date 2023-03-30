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
    const history = {
      1: setHistory1m,
      3: setHistory3m,
      5: setHistory5m,
    }

    if (lastMessage !== null) {
      // Sort messages by interval for appropriate chart.
      const data = JSON.parse(lastMessage.data)
      for (const json of data) {
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
              5: {
                hma: json.criteria.hma.state,
              },
            }
          })
        }
      }
    }
  }, [lastMessage])

  return (
    <div className="grid grid-cols-5 h-screen">
      <Status className="col-span-1" data={statusData}></Status>
      <div className="col-span-4 grid grid-cols-3 grid-rows-2 h-screen">
        <CandleChart interval={1} history={history1m} />
        <CandleChart interval={3} history={history3m} />
        <CandleChart interval={5} history={history5m} />
        <LineChart history={history1m} />
      </div>
    </div>
  )
}

export default Dashboard
