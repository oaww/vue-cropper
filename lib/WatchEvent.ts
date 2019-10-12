/**
 * WactchEvent 消息通知
 */

interface MessageEvent {
  type: string
}

class WactchEvent {
  handlers: Map<string, Array<() => void>>
  constructor() {
    this.handlers = new Map()
  }

  addHandler(type: string, handler: () => void) {
    const res: Array<() => void> | undefined = this.handlers.get(type)
    let arr: Array<() => void> = []
    if (res) {
      arr = [...res]
    }
    arr.push(handler)
    this.handlers.set(type, arr)
  }

  fire(event: MessageEvent) {
    const res: Array<() => void> | undefined = this.handlers.get(event.type)
    if (!res) {
      return
    }
    res.forEach((func: (event: MessageEvent) => void) => {
      func(event)
    })
  }

  removeHandler(type: string, handler: () => void) {
    const res: Array<() => void> | undefined = this.handlers.get(type)
    if (!res) {
      return
    }
    let i = 0
    for (const len = res.length; i < len; i++) {
      if (res[i] === handler) {
        break
      }
    }
    res.splice(i, 1)
    this.handlers.set(type, res)
  }
}

export default WactchEvent
