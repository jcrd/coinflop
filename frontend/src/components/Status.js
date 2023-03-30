import React, { useEffect, useState } from "react"

const StatusComponent = ({ status }) => {
  let text = "failing"
  let background = "bg-red-500"
  if (status) {
    text = "passing"
    background = "bg-green-500"
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
  const [passing, setPassing] = useState(false)
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
    setPassing(data.passing)
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
              <StatusComponent status={bbands1m} />
              <p className="p-1">stochRSI</p>
              <StatusComponent status={stochRSI1m} />
              <p className="p-1">HMA</p>
              <StatusComponent status={hma1m} />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <h1>3m</h1>
            <div className="grid grid-cols-2">
              <p className="p-1">HMA</p>{" "}
              <StatusComponent name="hma" status={hma3m} />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <h1>5m</h1>
            <div className="grid grid-cols-2">
              <p className="p-1">HMA</p>
              <StatusComponent name="hma" status={hma5m} />
            </div>
          </div>
        </div>
        <StatusComponent name="passing" status={passing} />
      </div>
      <ol className="h-3/5 overflow-y-scroll px-8">
        {logMessages.map((msg) => (
          <li>{msg}</li>
        ))}
      </ol>
    </div>
  )
}

export default Status
