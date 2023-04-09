const Round = ({ value }) => {
  return (
    <div className="shrink-0">
      <div>{value.epoch}</div>
      <div className="grid grid-cols-2">
        <div>Bet</div>
        <div>{value.direction ? value.direction : "-"}</div>
        <div>Amount</div>
        <div>{value.amount ? value.amount : "-"}</div>
        <div>Result</div>
        <div>{value.result ? value.result : "-"}</div>
        <div>Win</div>
        <div>
          {value.direction && value.direction !== "Skip"
            ? value.win
              ? "true"
              : "false"
            : "-"}
        </div>
      </div>
    </div>
  )
}

const RoundHistory = ({ data }) => {
  return (
    <div className="flex gap-x-4 overflow-x-scroll mx-8">
      {data.map((v) => (
        <Round value={v} />
      ))}
    </div>
  )
}

export default RoundHistory
