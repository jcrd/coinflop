import { StrategyEngine, TAStrategy } from "../strategy.js"

import Consensus from "./consensus.js"
import Dumb from "./dumb.js"

export default new StrategyEngine([
  new TAStrategy("ta_data", "data"),
  new Consensus(),
  new Dumb(),
])
