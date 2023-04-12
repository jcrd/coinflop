export const Direction = {
  Bear: "Bear",
  Bull: "Bull",
  Skip: "Skip",
}

export const Signals = {
  Round: {
    Start: "Round.Start",
    AlreadyBet: "Round.AlreadyBet",
    Bet: "Round.Bet",
    WaitForLock: "Round.WaitForLock",
    Lock: "Round.Lock",
    Error: "Round.Error",
    Close: "Round.Close",
    BetAction: "Round.BetAction",
    BetWindow: {
      Early: "Round.BetWindow.Early",
      Late: "Round.BetWindow.Late",
    },
    Event: {
      BetBull: "Round.Event.BetBull",
      BetBear: "Round.Event.BetBear",
    },
  },
  Broadcast: "Broadcast",
}
