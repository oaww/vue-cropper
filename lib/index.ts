import VueCropper from './vue-cropper'

// 兼容性处理
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = fn => {
    return setTimeout(fn, 17)
  }
}
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = id => {
    clearTimeout(id)
  }
}

const install = (Vue: any) => {
  Vue.component('VueCropper', VueCropper)
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export { VueCropper }

export default {
  version: '1.0.0',
  install,
  VueCropper,
}
