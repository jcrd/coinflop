import { VictoryAxis, VictoryLabel } from "victory"

const Axis = (values) => {
  return (
    <VictoryAxis
      tickValues={values}
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
  )
}

export default Axis
