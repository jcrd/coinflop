import { Console } from "console"

import { Spot, WebsocketStream } from "@binance/connector"

import Emitter from "../emitter.js"

const API = {
  ws: "wss://stream.binance.us:9443",
  spot: "https://api.binance.us",
}
const klineSymbol = "bnbusd"
const restLimit = 1000

const logger = new Console({ stdout: process.stdout, stderr: process.stderr })

function getFormat(interval) {
  return interval === 60 ? "1h" : interval + "m"
}

function normalizeRest(json) {
  const [openTime, open, high, low, close, volume, closeTime, ...r] = json
  return {
    timestamp: closeTime,
    openTime: openTime,
    closeTime: closeTime,
    ohlc: {
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
    },
    volume: parseFloat(volume),
  }
}

function normalizeWs(json) {
  return {
    timestamp: json.E,
    openTime: json.k.t,
    closeTime: json.k.T,
    ohlc: {
      open: parseFloat(json.k.o),
      high: parseFloat(json.k.h),
      low: parseFloat(json.k.l),
      close: parseFloat(json.k.c),
    },
    // Volume info is not available via websocket API.
    volume: 0.0,
  }
}

export default class Kline extends Emitter {
  constructor() {
    super()
    this.websockets = {}
  }

  async subscribe(interval, historical = true) {
    if (interval in this.websockets) {
      return
    }

    const callbacks = {
      message: (data) => {
        data = JSON.parse(data)
        // True if this message marks kline close.
        if (data.k.x) {
          this.emitter.emit("Update", interval, normalizeWs(data))
        }
      },
    }

    const ws = new WebsocketStream({
      wsURL: API.ws,
      logger,
      callbacks,
    })
    this.websockets[interval] = ws

    const intervalFormat = getFormat(interval)

    ws.kline(klineSymbol, intervalFormat)

    if (historical) {
      const spot = new Spot("", "", { baseURL: API.spot })
      try {
        const data = (
          await spot.klines(klineSymbol, intervalFormat, {
            limit: restLimit,
          })
        ).data
        for (const d of data) {
          this.emitter.emit("Update", interval, normalizeRest(d))
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  close() {
    for (const i in this.websockets) {
      this.websockets[i].close()
    }
  }
}
