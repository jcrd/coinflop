import React, { useEffect, useState } from "react"

const StatusComponent = ({ state }) => {
  let text = "NONE"
  let background = "bg-yellow-500"
  if (state === true) {
    text = "BULL"
    background = "bg-green-500"
  }
  if (state === false) {
    text = "BEAR"
    background = "bg-red-500"
  }
  return <div className={`mx-auto p-1 ${background} rounded`}>{text}</div>
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
    if (data.length === 0) {
      return
    }
    setBbands1m(data[1].bbands)
    setStochRSI1m(data[1].stochRSI)
    setHMA1m(data[1].hma)
    setHMA3m(data[3].hma)
    setHMA5m(data[5].hma)
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
        <StatusComponent state={direction} />
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
