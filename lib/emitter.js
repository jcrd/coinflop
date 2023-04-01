import { EventEmitter } from "events"

export default class Emitter {
  constructor() {
    this.emitter = new EventEmitter()
    this.observers = {}
  }

  addObserver(observer) {
    for (const signal in observer.signals) {
      this.emitter.on(signal, observer.signals[signal])
    }
    this.observers[observer.name] = observer
  }

  removeObserver(name) {
    if (!(name in this.observers)) {
      return
    }
    const observer = this.observers[name]
    for (const signal in observer.signals) {
      this.emitter.off(signal, observer.signals[signal])
    }
  }

  removeAllObservers() {
    for (const name in this.observers) {
      const observer = this.observers[name]
      for (const signal in observer.signals) {
        this.emitter.off(signal, observer.signals[signal])
      }
    }
  }
}
