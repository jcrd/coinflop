import React, { useEffect, useState } from "react"

import Axis from "./Axis.js"

import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from "victory"

const LineChart = ({ history }) => {
  const kColor = "#a899df"
  const dColor = "#2fc3eb"

  const [stochRSIK, setStochRSIK] = useState([])
  const [stochRSID, setStochRSID] = useState([])
  const [axisValues, setAxisValues] = useState([])

  useEffect(() => {
    const setState = {
      stochRSI: {
        k: setStochRSIK,
        d: setStochRSID,
      },
    }

    for (const type in setState) {
      for (const name in setState[type]) {
        setState[type][name]([])
      }
    }

    history.forEach((v) => {
      const date = new Date(v.closeTime)

      setAxisValues((prev) => prev.concat(date))

      const rsi = v.criteria.stochRSI
      for (const name in rsi.values) {
        const set = setState.stochRSI[name]
        set((prev) =>
          prev.concat({
            x: date,
            y: parseFloat(rsi.values[name]),
          })
        )
      }
    })
  }, [history])

  return (
    <VictoryChart
      theme={VictoryTheme.material}
      scale={{ x: "time" }}
      height={200}
    >
      {Axis(axisValues)}
      <VictoryAxis dependentAxis />
      <VictoryLine
        data={stochRSIK}
        style={{ data: { stroke: kColor, strokeWidth: 0.5 } }}
      />
      <VictoryLine
        data={stochRSID}
        style={{ data: { stroke: dColor, strokeWidth: 0.5 } }}
      />
      <VictoryLegend
        x={125}
        centerTitle
        orientation="horizontal"
        gutter={20}
        style={{ border: { stroke: "black" }, title: { fontSize: 4 } }}
        data={[
          { name: "k", symbol: { fill: kColor } },
          { name: "d", symbol: { fill: dColor } },
        ]}
      />
    </VictoryChart>
  )
}

export default LineChart
