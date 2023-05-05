import { StrategyEngine, WorkerStrategy } from "./strategy.js"

export default new StrategyEngine([new WorkerStrategy("ta_nimble", "nimble")])
