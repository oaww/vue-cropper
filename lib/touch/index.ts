/**
 * TouchEvent 手势类库
 */

// 消息通知
import WatchEvent from '../watchEvent'

interface InterfaceAxis {
  x: number
  y: number
}

/**
 * 1. 单指 用于计算移动点的坐标距离
 * 2. 双指缩放
 *    计算前后两个点的连线距离然后跳转缩放比例
 *    两个点的中心
 *    v = {
 *      x: t[1].x - t[0].x,
 *      y: t[1].y - t[0].y,
 *    }
 *    getLen(v) {
 *      return Math.sqrt(v.x * v.x + v.y * v.y);
 *    }
 *    scale = getLen(v) / getLen(pre)
 *    注： 可能需要根据节点大小 不同调整系数， 同时需要有个累加缩放过程
 * 3. 双指旋转
 *    利用内积， 求出两次手势变化的夹角， 用差乘(vector cross)正负来判断方向
 *    坐标原点为不动的那一根手指，计算变化的那根手指的角度
 *    v1: now v2: pre
 *    内积  r = (v1.x * v2.x + v1.y * v2.y ) / getLen(v1) * getLen(v2)
 *         r = r > 1 ? 1 : r
 *         angel = Math.acos(r);
 *    差乘  crosss = v1.x * v2.y - v2.x * v1.y
 *    if  cross > 1  angel *=  -1
 *    angle * 180 / Math.PI
 */

// 当前设备是否判断是否支持touch事件
const SUPPORT_TOUCH = 'ontouchstart' in window

class TouchEvent {
  // 默认配置属性
  static defaultOptions: any = {}
  element: HTMLElement
  options: any
  pre: InterfaceAxis
  watcher: WatchEvent
  constructor(element: HTMLElement, options?: any) {
    // 节点
    this.element = element
    // 配置属性
    this.options = Object.assign({}, TouchEvent.defaultOptions, options)

    this.pre = {
      x: 0,
      y: 0,
    }

    this.watcher = new WatchEvent()
    this.element.addEventListener('mousedown', this.start.bind(this))
  }
  start() {
    this.element.addEventListener('mousemove', this.move.bind(this))
    this.element.addEventListener('mouseup', this.stop.bind(this))
  }
  move() {
    this.watcher.fire({
      type: 'mousemove',
    })
  }
  stop() {
    this.watcher.fire({
      type: 'mouseup',
    })
    this.element.removeEventListener('mousemove', this.move)
    this.element.removeEventListener('mouseup', this.stop)
  }
  // 绑定事件
  on(type: string, handler: () => void) {
    this.watcher.addHandler(type, handler)
  }
  // 解绑事件
  off(type: string, handler: () => void) {
    this.watcher.removeHandler(type, handler)
  }
}

export default TouchEvent
