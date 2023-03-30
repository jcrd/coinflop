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

  const [candleAxis, setCandleAxis] = useState([])
  const [candleData, setCandleData] = useState([])

  const [hmaData, setHMAData] = useState([])

  useEffect(() => {
    const setState = {
      bbands: {
        lower: setBbandLower,
        middle: setBbandMiddle,
        upper: setBbandUpper,
        close: setBbandClose,
        fail: setBbandFail,
      },
      hma: {
        data: setHMAData,
      },
      candle: {
        axis: setCandleAxis,
        data: setCandleData,
      },
    }

    for (const type in setState) {
      for (const name in setState[type]) {
        setState[type][name]([])
      }
    }

    history.forEach((v) => {
      const date = new Date(v.closeTime)

      setCandleAxis((prev) => prev.concat(date))
      setCandleData((prev) =>
        prev.concat({
          x: date,
          open: parseFloat(v.ohlc.open),
          high: parseFloat(v.ohlc.high),
          low: parseFloat(v.ohlc.low),
          close: parseFloat(v.ohlc.close),
        })
      )

      const hma = v.criteria.hma
      if ("hma" in hma.values) {
        setState.hma.data((prev) =>
          prev.concat({
            x: date,
            y: parseFloat(hma.values.hma),
          })
        )
      }

      if (v.interval === 1) {
        const bb = v.criteria.bbands
        for (const name in bb.values) {
          const set = setState.bbands[name]
          set((prev) =>
            prev.concat({
              x: date,
              y: parseFloat(bb.values[name]),
            })
          )
        }
        const bbSet = bb.state ? setState.bbands.close : setState.bbands.fail
        bbSet((prev) =>
          prev.concat({
            x: date,
            y: parseFloat(v.ohlc.close),
          })
        )
      }
    })
  }, [history])

  return (
    <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
      <VictoryAxis
        tickValues={candleAxis}
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
        data={hmaData}
        interpolation="natural"
        style={{ data: { stroke: "#89723a", strokeWidth: 0.5 } }}
      />
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
      <VictoryCandlestick data={candleData} />
    </VictoryChart>
  )
}

export default Chart
