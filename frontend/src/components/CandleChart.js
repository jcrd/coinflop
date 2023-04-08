import React, { useEffect, useState } from "react"

import Axis from "./Axis.js"
import { arrayTransformer } from "./util.js"

import {
  VictoryAxis,
  VictoryCandlestick,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from "victory"

const Chart = ({ history }) => {
  const { define, get, update } = arrayTransformer()

  define({
    name: "chartAxis",
    state: useState([]),
    transform: (v) => new Date(v.closeTime),
  })
  define({
    name: "chartData",
    state: useState([]),
    transform: (v) => ({
      x: new Date(v.closeTime),
      open: parseFloat(v.ohlc.open),
      high: parseFloat(v.ohlc.high),
      low: parseFloat(v.ohlc.low),
      close: parseFloat(v.ohlc.close),
    }),
  })
  define({
    name: "bbLower",
    state: useState([]),
    cond: (v) => v.interval === 1,
    transform: (v) => ({
      x: new Date(v.closeTime),
      y: parseFloat(v.criteria.bbands.values.lower),
    }),
  })
  define({
    name: "bbMiddle",
    state: useState([]),
    cond: (v) => v.interval === 1,
    transform: (v) => ({
      x: new Date(v.closeTime),
      y: parseFloat(v.criteria.bbands.values.middle),
    }),
  })
  define({
    name: "bbUpper",
    state: useState([]),
    cond: (v) => v.interval === 1,
    transform: (v) => ({
      x: new Date(v.closeTime),
      y: parseFloat(v.criteria.bbands.values.upper),
    }),
  })
  define({
    name: "bbClose",
    state: useState([]),
    cond: (v) => v.interval === 1,
    transform: (v) => ({
      x: new Date(v.closeTime),
      y: parseFloat(v.ohlc.close),
    }),
  })
  define({
    name: "hmaData",
    state: useState([]),
    cond: (v) => "hma" in v.criteria.hma.values,
    transform: (v) => ({
      x: new Date(v.closeTime),
      y: parseFloat(v.criteria.hma.values.hma),
    }),
  })

  useEffect(() => {
    update(history)
  }, [history])

  return (
    <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
      {Axis(get("chartAxis"))}
      <VictoryAxis dependentAxis />
      <VictoryLine
        data={get("hmaData")}
        interpolation="natural"
        style={{ data: { stroke: "#89723a", strokeWidth: 0.5 } }}
      />
      <VictoryLine
        data={get("bbLower")}
        interpolation="natural"
        style={{ data: { stroke: "#ff0040", strokeWidth: 0.5 } }}
      />
      <VictoryLine
        data={get("bbMiddle")}
        interpolation="natural"
        style={{ data: { stroke: "#ffb500", strokeWidth: 0.5 } }}
      />
      <VictoryLine
        data={get("bbUpper")}
        interpolation="natural"
        style={{ data: { stroke: "#0006ff", strokeWidth: 0.5 } }}
      />
      <VictoryScatter data={get("bbClose")} size={0.5} />
      <VictoryCandlestick data={get("chartData")} />
    </VictoryChart>
  )
}

export default Chart
