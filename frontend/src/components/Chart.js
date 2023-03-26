import React, { useEffect, useState } from "react"

import {
  VictoryAxis,
  VictoryCandlestick,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from "victory"

const Chart = ({ history }) => {
  const [bbandLower, setBbandLower] = useState([])
  const [bbandMiddle, setBbandMiddle] = useState([])
  const [bbandUpper, setBbandUpper] = useState([])
  const [bbandClose, setBbandClose] = useState([])
  const [bbandFail, setBbandFail] = useState([])

  useEffect(() => {
    const bbands = {
      lower: [],
      middle: [],
      upper: [],
      close: [],
      fail: [],
    }
    history.forEach((v) => {
      const date = new Date(v.closeTime)
      if (v.interval === 1) {
        const bb = v.criteria.bbands
        for (const name in bb.values) {
          bbands[name] = bbands[name].concat({
            x: date,
            y: parseFloat(bb.values[name]),
          })
        }
        const point = {
          x: date,
          y: parseFloat(v.ohlc.close),
        }
        if (bb.state) {
          bbands.close = bbands.close.concat(point)
        } else {
          bbands.fail = bbands.fail.concat(point)
        }
      }
    })
    setBbandLower(bbands.lower)
    setBbandMiddle(bbands.middle)
    setBbandUpper(bbands.upper)
    setBbandClose(bbands.close)
    setBbandFail(bbands.fail)
  }, [
    history,
    setBbandLower,
    setBbandMiddle,
    setBbandUpper,
    setBbandClose,
    setBbandFail,
  ])

  return (
    <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
      <VictoryAxis
        tickValues={history.map((v) => new Date(v.closeTime))}
        tickFormat={(d) => {
          try {
            return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
          } catch (e) {
            if (!(e instanceof TypeError)) {
              throw e
            }
          }
        }}
        tickLabelComponent={
          <VictoryLabel angle={-45} style={[{ fontSize: 4 }]} />
        }
      />
      <VictoryAxis dependentAxis />
      <VictoryLine
        data={bbandLower}
        interpolation="natural"
        style={{ data: { stroke: "#ff0040", strokeWidth: 0.5 } }}
      />
      <VictoryLine
        data={bbandMiddle}
        interpolation="natural"
        style={{ data: { stroke: "#ffb500", strokeWidth: 0.5 } }}
      />
      <VictoryLine
        data={bbandUpper}
        interpolation="natural"
        style={{ data: { stroke: "#0006ff", strokeWidth: 0.5 } }}
      />
      <VictoryScatter data={bbandClose} size={0.5} />
      <VictoryScatter
        data={bbandFail}
        style={{ data: { fill: "#c43a31" } }}
        size={0.5}
      />
      <VictoryCandlestick
        data={history.map((v) => {
          const d = {
            x: new Date(v.closeTime),
            open: parseFloat(v.ohlc.open),
            high: parseFloat(v.ohlc.high),
            low: parseFloat(v.ohlc.low),
            close: parseFloat(v.ohlc.close),
          }
          return d
        })}
      />
    </VictoryChart>
  )
}

export default Chart
