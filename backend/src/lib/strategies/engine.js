import { StrategyEngine, TAStrategy } from "../strategy.js"

export default new StrategyEngine([new TAStrategy("prediction", "predictor")])
