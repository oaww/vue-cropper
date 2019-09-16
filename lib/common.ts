import exif from './exif'

import { InterfaceLayoutStyle } from './interface'

import Conversion from './conversion'
const conversion = new Conversion()

// 加载图片方法
export const loadImg = async (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
    // 判断如果不是base64图片 再添加crossOrigin属性，否则会导致iOS低版本(10.2)无法显示图片
    if (url.substr(0, 4) !== 'data') {
      img.crossOrigin = ''
    }
  })
}

// 获取图片的 orientation角度
export const getExif = (img: HTMLImageElement): Promise<any> => {
  return exif.getData(img)
}

// 重置图片
export const resetImg = (
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  orientation: number,
): HTMLCanvasElement => {
  return (canvas = conversion.render(img, canvas, orientation))
}

// 给出图片的大小和容器大小 还有布局方式， 返回布局。
export const createImgStyle = (
  imgStyle: InterfaceLayoutStyle,
  layoutStyle: InterfaceLayoutStyle,
  mode: string,
): any => {
  console.log(imgStyle, layoutStyle, mode)
}
