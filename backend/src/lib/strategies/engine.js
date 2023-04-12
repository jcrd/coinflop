import { StrategyEngine } from "../strategy.js"

import Consensus from "./consensus.js"
import TASimple from "./ta_simple.js"

export default new StrategyEngine([new TASimple(), new Consensus()])
