// 拖拽类

import WatchEvent from './WatchEvent'

const watcher = new WatchEvent()

class DragDrop {
  dom: HTMLElement

  constructor(dom: HTMLElement) {
    this.dom = dom
  }
}
