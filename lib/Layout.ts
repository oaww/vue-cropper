import { InterfaceLayoutStyle, InterfaceModeHandle } from './interface'

const layout = (
  imgStyle: InterfaceLayoutStyle,
  layoutStyle: InterfaceLayoutStyle,
  mode: keyof InterfaceModeHandle,
) => {
  // 返回图片缩放大小，以及图片基于容器的坐标点
  let handleType: keyof InterfaceModeHandle = 'default'
  for (const key of Object.keys(modeHandle)) {
    if (key === mode) {
      handleType = mode
      break
    }
  }
  const handle = modeHandle[handleType]
  return handle(imgStyle, layoutStyle)
}

const modeHandle = {
  contain: (imgStyle: InterfaceLayoutStyle, layoutStyle: InterfaceLayoutStyle) => {
    console.log(imgStyle, layoutStyle)
  },
  default: (imgStyle: InterfaceLayoutStyle, layoutStyle: InterfaceLayoutStyle) => {
    console.log(imgStyle, layoutStyle)
  },
}

export default layout
