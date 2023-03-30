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

const Status = ({ data }) => {
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
    <div className="flex flex-col space-y-4 bg-slate-500 pt-6">
      <div>{newDate(timestampData)}</div>
      <div>
        <h1>1m</h1>
        <div className="grid grid-cols-2">
          bbands <StatusComponent status={bbands1m} />
          stochRSI <StatusComponent status={stochRSI1m} />
          HMA <StatusComponent status={hma1m} />
        </div>
      </div>
      <div>
        <h1>3m</h1>
        <div className="grid grid-cols-2">
          HMA <StatusComponent name="hma" status={hma3m} />
        </div>
      </div>
      <div>
        <h1>5m</h1>
        <div className="grid grid-cols-2">
          HMA <StatusComponent name="hma" status={hma5m} />
        </div>
      </div>
      <StatusComponent name="passing" status={passing} />
    </div>
  )
}

export default Status
