import { StrategyEngine, TAStrategy } from "../strategy.js"

import Consensus from "./consensus.js"

export default new StrategyEngine([
  new TAStrategy("ta_simple", "simple"),
  new Consensus(),
])
