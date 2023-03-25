import {
  VictoryTheme,
  VictoryChart,
  VictoryAxis,
  VictoryCandlestick,
  VictoryLabel,
} from "victory"

const Chart = ({ history }) => {
  return (
    <VictoryChart theme={VictoryTheme.material}>
      <VictoryAxis
        scale={{ x: "time" }}
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
          <VictoryLabel angle={-45} style={[{ fontSize: 7 }]} />
        }
      />
      <VictoryAxis dependentAxis />
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
