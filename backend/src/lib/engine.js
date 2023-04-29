import {
  StrategyEngine,
  PredictStreamStrategy,
  PredictQueryStrategy,
} from "./strategy.js"

export default new StrategyEngine([
  new PredictStreamStrategy(
    "predict:stream:continuous",
    "trend_predictor_continuous",
    "predictor"
  ),
  new PredictQueryStrategy(
    "predict:query:continuous",
    "trend_predictor_continuous",
    false
  ),
  new PredictQueryStrategy(
    "predict:query:continuous:moment",
    "trend_predictor_continuous",
    true
  ),
])
