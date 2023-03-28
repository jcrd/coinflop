import React, { useEffect, useState } from "react"

import {
  VictoryAxis,
  VictoryCandlestick,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from "victory"

const Chart = ({ interval, history }) => {
  const [bbandLower, setBbandLower] = useState([])
  const [bbandMiddle, setBbandMiddle] = useState([])
  const [bbandUpper, setBbandUpper] = useState([])
  const [bbandClose, setBbandClose] = useState([])
  const [bbandFail, setBbandFail] = useState([])

  const [stochRSIK, setStochRSIK] = useState([])
  const [stochRSID, setStochRSID] = useState([])
  const [stochRSIPass, setStochRSIPass] = useState([])

  const [candleAxis, setCandleAxis] = useState([])
  const [candleData, setCandleData] = useState([])

  const [hmaData, setHMAData] = useState([])

  const StochRSIChart = () => {
    const kColor = "#a899df"
    const dColor = "#2fc3eb"
    if (interval === 1) {
      return (
        <VictoryChart
          theme={VictoryTheme.material}
          scale={{ x: "time" }}
          height={200}
        >
          <VictoryAxis
            tickLabelComponent={
              <VictoryLabel angle={-45} style={[{ fontSize: 8 }]} />
            }
          />
          <VictoryAxis dependentAxis />
          <VictoryLine
            data={stochRSIK}
            interpolation="natural"
            style={{ data: { stroke: kColor, strokeWidth: 0.5 } }}
          />
          <VictoryLine
            data={stochRSID}
            interpolation="natural"
            style={{ data: { stroke: dColor, strokeWidth: 0.5 } }}
          />
          <VictoryScatter data={stochRSIPass} />
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
    return null
  }

  useEffect(() => {
    const setState = {
      bbands: {
        lower: setBbandLower,
        middle: setBbandMiddle,
        upper: setBbandUpper,
        close: setBbandClose,
        fail: setBbandFail,
      },
      stochRSI: {
        k: setStochRSIK,
        d: setStochRSID,
        pass: setStochRSIPass,
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
        if (rsi.state) {
          setState.stochRSI.pass((prev) =>
            prev.concat({ x: date, y: rsi.values.k })
          )
        }
      }
    })
  }, [history])

  return (
    <div className="flex flex-col">
      <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}>
        <VictoryAxis
          tickValues={candleAxis}
          tickFormat={(d) => {
            try {
              return `${d.getHours()}:${String(d.getMinutes()).padStart(
                2,
                "0"
              )}`
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
      <StochRSIChart />
    </div>
  )
}

export default Chart
