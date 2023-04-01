import WebSocket from "ws"

import Emitter from "../emitter.js"

const limits = {
  1: 200,
  3: 100,
  5: 100,
}

const API = {
  ws: (interval) => `wss://stream.binance.us:9443/ws/bnbusd@kline_${interval}m`,
  rest: (interval) => {
    return `https://api.binance.us/api/v3/klines?symbol=BNBUSD&limit=${limits[interval]}&interval=${interval}m`
  },
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
    this.activeKlines = {}
  }

  async subscribe(interval) {
    if (!(interval in this.websockets)) {
      this.websockets[interval] = new WebSocket(API.ws(interval))
    }
    try {
      const resp = await fetch(API.rest(interval))
      const json = await resp.json()
      for (const j of json) {
        this.emitter.emit("Update", interval, normalizeRest(j))
      }
    } catch (e) {
      console.log(e)
    }

    this.websockets[interval].on("message", (data) => {
      data = normalizeWs(JSON.parse(data))

      if (
        interval in this.activeKlines &&
        data.openTime != this.activeKlines[interval].openTime
      ) {
        this.emitter.emit("Update", interval, this.activeKlines[interval])
      }
      this.activeKlines[interval] = data
    })
  }

  close() {
    for (const i in this.websockets) {
      this.websockets[i].close()
    }
  }
}
