import VueCropper from './vue-cropper'

const install = function(Vue: any) {
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
  vueCropper: VueCropper,
}
