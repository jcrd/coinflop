import React, { useEffect, useState } from "react"

import Axis from "./Axis.js"
import { arrayTransformer } from "./util.js"

import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTheme,
} from "victory"

const LineChart = ({ history }) => {
  const { define, get, update } = arrayTransformer()

  const kColor = "#a899df"
  const dColor = "#2fc3eb"

  define({
    name: "stochRSIk",
    state: useState([]),
    transform: (v) => ({
      x: new Date(v.closeTime),
      y: parseFloat(v.criteria.stochRSI.values.k),
    }),
  })
  define({
    name: "stochRSId",
    state: useState([]),
    transform: (v) => ({
      x: new Date(v.closeTime),
      y: parseFloat(v.criteria.stochRSI.values.d),
    }),
  })
  define({
    name: "chartAxis",
    state: useState([]),
    transform: (v) => new Date(v.closeTime),
  })

  useEffect(() => {
    update(history)
  }, [history])

  return (
    <VictoryChart
      theme={VictoryTheme.material}
      scale={{ x: "time" }}
      height={200}
    >
      {Axis(get("chartAxis"))}
      <VictoryAxis dependentAxis />
      <VictoryLine
        data={get("stochRSIk")}
        style={{ data: { stroke: kColor, strokeWidth: 0.5 } }}
      />
      <VictoryLine
        data={get("stochRSId")}
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
