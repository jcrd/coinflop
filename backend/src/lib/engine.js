import {
  StrategyEngine,
  PredictStreamStrategy,
  PredictQueryStrategy,
} from "./strategy.js"

export default new StrategyEngine(
  [5, 6, 7]
    .map((i) => [
      new PredictStreamStrategy(
        { type: "continuous", interval: "1m", horizon: i },
        "predictor"
      ),
      new PredictQueryStrategy(
        { type: "continuous", interval: "1m", horizon: i },
        false
      ),
      new PredictQueryStrategy(
        { type: "continuous", interval: "1m", horizon: i },
        true
      ),
    ])
    .flat()
)
