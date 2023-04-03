import React, { useEffect, useState } from "react"

const StatusComponent = ({ state }) => {
  return (
    <div className="mx-auto flex">
      <div
        className={`p-1 ${state.up ? "bg-green-500" : "bg-red-500"} rounded`}
      >
        BULL
      </div>
      <div
        className={`p-1 ${state.down ? "bg-green-500" : "bg-red-500"} rounded`}
      >
        BEAR
      </div>
    </div>
  )
}

function newDate(epoch) {
  const date = new Date(epoch)
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "long",
    timeZone: "America/New_York",
  }).format(date)
}

const Status = ({ data, logMessages }) => {
  const [bbands1m, setBbands1m] = useState(false)
  const [stochRSI1m, setStochRSI1m] = useState(false)
  const [hma1m, setHMA1m] = useState(false)
  const [hma3m, setHMA3m] = useState(false)
  const [hma5m, setHMA5m] = useState(false)
  const [direction, setDirection] = useState(false)
  const [timestampData, setTimestampData] = useState(0)

  useEffect(() => {
    setBbands1m(data[1].bbands.state)
    setStochRSI1m(data[1].stochRSI.state)
    setHMA1m(data[1].hma.state)
    setHMA3m(data[3].hma.state)
    setHMA5m(data[5].hma.state)
    setDirection(data.state)
    setTimestampData(data.timestamp)
  }, [data])

  return (
    <div className="flex flex-col max-h-screen bg-slate-500 pt-6">
      <div className="h-2/5 flex flex-col gap-y-6">
        <div>{newDate(timestampData)}</div>
        <div>
          <div className="flex flex-col gap-y-4">
            <h1>1m</h1>
            <div className="grid grid-cols-2">
              <p className="p-1">bbands</p>
              <StatusComponent state={bbands1m} />
              <p className="p-1">stochRSI</p>
              <StatusComponent state={stochRSI1m} />
              <p className="p-1">HMA</p>
              <StatusComponent state={hma1m} />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <h1>3m</h1>
            <div className="grid grid-cols-2">
              <p className="p-1">HMA</p> <StatusComponent state={hma3m} />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <h1>5m</h1>
            <div className="grid grid-cols-2">
              <p className="p-1">HMA</p>
              <StatusComponent state={hma5m} />
            </div>
          </div>
        </div>
        <div
          className={`p-1 ${
            direction === true
              ? "bg-green-500"
              : direction === false
              ? "bg-red-500"
              : "bg-yellow-500"
          } rounded`}
        >
          {direction === true ? "BULL" : direction === false ? "BEAR" : "NONE"}
        </div>
      </div>
      <div className="h-3/5 overflow-y-scroll px-8">
        {logMessages.map((v) => (
          <div>{v.message}</div>
        ))}
      </div>
    </div>
  )
}

export default Status
