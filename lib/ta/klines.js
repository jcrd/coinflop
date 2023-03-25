import WebSocket from "ws"

const API = {
  ws: (interval) => `wss://stream.binance.us:9443/ws/bnbusd@kline_${interval}m`,
  rest: (interval) => {
    const limit = 10
    return `https://api.binance.us/api/v3/klines?symbol=BNBUSD&limit=${limit}&interval=${interval}m`
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

function newDate(epoch) {
  const date = new Date(epoch)
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "long",
    timeZone: "America/New_York",
  }).format(date)
}

function logKline(interval, data) {
  console.log({
    interval: interval,
    timestamp: newDate(data.timestamp),
    openTime: newDate(data.openTime),
    closeTime: newDate(data.closeTime),
    ohlc: data.ohlc,
    volume: data.volume,
  })
}

export default function () {
  const websockets = {}
  const activeKlines = {}

  return {
    on: async (interval, callback) => {
      if (!(interval in websockets)) {
        websockets[interval] = new WebSocket(API.ws(interval))
      }
      try {
        const resp = await fetch(API.rest(interval))
        const json = await resp.json()
        for (const j of json) {
          const data = normalizeRest(j)
          logKline(interval, data)
          callback(data)
        }
      } catch (e) {
        console.log(e)
      }
      websockets[interval].on("message", (data) => {
        data = normalizeWs(JSON.parse(data))

        logKline(interval, data)

        if (
          interval in activeKlines &&
          data.openTime != activeKlines[interval].openTime
        ) {
          callback(activeKlines[interval])
        }
        activeKlines[interval] = data
      })
    },

    close: () => {
      for (const i in websockets) {
        websockets[i].close()
      }
    },
  }
}